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

import { IWebRequest } from './IWebRequest';
import { environment } from './JaffExpress';

export interface RequestLogEntry {
  time: number;
  category?: string;
  message: string | Error | any;
  stack?: any;
}

/** @deprecated make the idea of dev request log simpler, easier to use */
export const RequestLogEntry = {
  error: (err: Error, category?: string): RequestLogEntry => {
    return {
      time: new Date().getTime(),
      category,
      message: err?.message,
      stack: err?.stack
    };
  },

  message: (msg: string, category?: string, stack?: any): RequestLogEntry => {
    return {
      time: new Date().getTime(),
      category,
      message: msg,
      stack
    };
  }
};

/** Adds a log entry to specified request, with environment check */
export function addRequestLog(req: IWebRequest, entry: RequestLogEntry | (() => RequestLogEntry)) {
  if (environment.isLocal) {
    const value = typeof entry === 'function' ? entry() : entry;
    if (!value.stack) {
      Error.captureStackTrace(value, addRequestLog);
    }
    req.locals.log?.push(value);
  }
}
