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

import * as express from 'express'
import { RequestContext } from './RequestContext';
import { RequestLogEntry } from './RequestLogEntry';
import { RequestError } from './errors/RequestError';

/**
 * Use this interface where you usually write 'express.Request'
 */
export interface IWebRequest<TUser = any> extends express.Request {
  user?: TUser;
  locals: IRequestLocals;
}

export interface IRequestLocals {
  context: RequestContext;
  /**
   * Logs that should exist only in local environment.<br>
   * <b>Do not expose this property in any env other than local!</b><br>
   * <b>Use addRequestLog() function to properly add entries!</b>
   */
  log?: RequestLogEntry[];
}

export interface INextFunction extends express.NextFunction {
  (err?: RequestError): void;
}
