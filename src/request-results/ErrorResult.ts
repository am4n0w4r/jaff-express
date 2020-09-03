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

import { AbstractResult } from './AbstractResult';
import { Response } from 'express';
import { Exception } from '../errors/Exception';
import { RequestValidationState } from '../model-validation/RequestValidationState';
import { environment } from '../JaffExpress';
import { ValidationResult } from '../model-validation/ValidationResult';

interface Result {
  status: number;
  errors: { [prop: string]: ErrorObj[] };
}

interface ErrorObj {
  message: string;
  stack?: string;
}

export type AcceptableErrors = Error | Exception | RequestValidationState | ValidationResult | string | string[];

export class ErrorResult<E extends AcceptableErrors = AcceptableErrors> extends AbstractResult {

  constructor(private err: E, private status?: number) {
    super();
  }

  sendTo(res: Response): void {
    res.status(this.status || 400);

    const result = { status: 400, errors: {} } as Result;

    if (Array.isArray(this.err)) {
      result.errors[''] = this.err.filter(e => !!e).map(e => e.toString());
    }
    else if (typeof this.err === 'string') {
      result.errors[''] = [{ message: this.err }];
    } else if (this.err instanceof Error) {
      const errorObj = { message: this.err.message } as ErrorObj;
      if (environment.isLocal) { errorObj.stack = this.err.stack; }
      result.errors[''] = [errorObj];

    } else if (this.err instanceof Exception) {
      const errorObj = { message: this.err.toString(environment.isLocal) } as ErrorObj;
      if (environment.isLocal) { errorObj.stack = this.err.stack; }
      result.errors[''] = [errorObj];

    } else if (this.err instanceof RequestValidationState) {
      for (const [prop, errors] of this.err.errors) {
        result.errors[prop] = errors.map(err => ({ message: err } as ErrorObj));
      }
    } else if (this.err instanceof ValidationResult) {
      this.err.errors.forEach(err => {
        const prop = err.propertyName ?? '';
        if (!result.errors[prop]) {
          result.errors[prop] = [];
        }
        result.errors[prop].push({ message: err.errorMessage });
      })
    }

    res.send(result);
  }
}

export function errorResult<E extends AcceptableErrors>(err: E, status?: number): ErrorResult<E> {
  return new ErrorResult(err, status);
}
