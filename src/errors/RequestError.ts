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

import { environment } from '../JaffExpress';

/** @deprecated well.. its place is not very well defined. Either look into and leave it, or find better approach.  */
export class RequestError {
  key?: string;
  message?: string;
  status?: number;
  cause?: RequestError;
  stack?: any;

  static create(key?: string) {
    return new RequestError(key);
  }

  private constructor(key?: string) {
    this.key = key;
    if (environment.isLocal) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }

  setStatus(code: number) {
    this.status = code;
    return this;
  }

  setCause(cause: RequestError) {
    this.cause = cause;
    return this;
  }

  setStack(stack: any) {
    if (environment.isLocal) {
      this.stack = stack;
    }
    return this;
  }
}
