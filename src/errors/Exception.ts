
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

export class Exception {
  readonly message: string;
  readonly cause?: Exception;
  stack?: any;

  static from(message: string, cause?: Exception | Error): Exception;
  static from(error: Error, cause?: Exception | Error): Exception;
  static from(messageOrError: string | Error, cause?: Exception | Error): Exception {
    const e = new Exception(messageOrError, cause);
    Error.captureStackTrace(e, Exception.from);
    if (typeof e.stack === 'string') {
      e.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
    }
    return e;
  }

  /** Prefer Exception.create() to construct new instances */
  constructor(msgOrError: string | Error, cause?: Exception | Error) {
    if (typeof msgOrError === 'string') {
      this.message = msgOrError;
    } else {
      this.message = msgOrError.message;
      this.stack = msgOrError.stack ?? this.stack;
    }
    if (!this.stack) {
      Error.captureStackTrace(this, this.constructor);
    }
    if (cause) {
      if (cause instanceof Exception) {
        this.cause = cause;
      } else {
        this.cause = new Exception(cause.message ?? 'Error');
        if (typeof cause.stack === 'string') {
          this.cause.stack = cause.stack.substring(cause.stack.indexOf('\n') + 1);
        }
      }
    }
  }

  getMessageWithInners() {
    let err = this as Exception;
    let msg = this.message;

    while (err.cause) {
      msg += `\n  Caused by ${err.cause.message}`;
      err = err.cause;
    }

    return msg;
  }

  toString(includeStack?: boolean): string {
    const causedBy = this.cause ? `\n  Caused by ${this.cause}` : '';
    const stack = includeStack ? (this.stack ? `\n${this.stack}` : '') : '';

    return `${this.constructor.name}: ${this.message}${stack}${causedBy}`;
  }
}
