/*
 * Copyright (c) 2020 am4n0w4r
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import * as express from 'express';
import { RequestContext } from './RequestContext';
import { INextFunction, IWebRequest } from './IWebRequest';
import { AuthScheme } from './authorization/AuthScheme';
import { addRequestLog, RequestLogEntry } from './RequestLogEntry';
import passport from 'passport';
import { RequestError } from './errors/RequestError';
import { Exception } from './errors/Exception';
import { environment } from './JaffExpress';

export type WebRequestHandler = (req: IWebRequest, res: express.Response, next: express.NextFunction) => any;

export const requestHandlers = {
  /** This has to be first handler in the chain */
  initializationHandler: (): WebRequestHandler => {
    return (req: IWebRequest, res: express.Response, next: express.NextFunction) => {
      req.locals = {
        context: new RequestContext(),
      };
      if (environment.isLocal) {
        req.locals.log = [];
      }
      next();
    };
  },

  authenticationHandler: (allowUnauthenticated = false): WebRequestHandler => {
    return (req: IWebRequest, res: express.Response, next: INextFunction) => {
      const authFn = passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) { return next(err); }
        req.user = user;
        if (user || allowUnauthenticated) {
          return next();
        } else {
          return next(RequestError.create('unauthorized').setStatus(401));
        }
      });

      authFn(req, res, next);
    };
  },

  authorizationHandler: (scheme: AuthScheme): WebRequestHandler | null => {
    if (!scheme) {
      return null;
    }

    return async (req: IWebRequest, res: express.Response, next: INextFunction) => {
      const errors = await scheme.validate(req);
      const schemeAuthorized = !errors.length;

      if (!schemeAuthorized) {
        addRequestLog(req, RequestLogEntry.message('Failed to authorize user', 'authorizationHandler'));
        next(RequestError.create('forbidden').setStatus(403));
      }
      next();
    };
  },

  /**
   * It should be used last in middleware chain,
   * as it is responsible for gathering errors and sending them back to client.
   */
  errorsHandler: (err: any, req: IWebRequest, res: express.Response, _next: INextFunction) => {

    if (err instanceof Error) {
      err = RequestError.create('internal-server-error').setStatus(500).setStack(err.stack);
    } else if (err instanceof Exception) {
      err = RequestError.create('internal-server-error')
        .setStatus(500)
        .setStack(err.stack)
        .setMessage(err.getMessageWithInners());
    } else if (typeof err === 'string') {
      err = RequestError.create('internal-server-error').setStatus(500).setMessage(err);
    }

    addRequestLog(req, () => RequestLogEntry.message(err?.message ?? 'Error caught', 'error-handler', err.stack));

    res.status(err?.status ?? 500);
    const body = { error: err } as any;
    if (environment.isLocal) {
      body.log = req.locals.log;
    }
    res.json(body);
  }
};
