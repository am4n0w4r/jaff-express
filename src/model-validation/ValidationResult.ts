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

import { IValidationFailure, ValidationFailure } from './IValidationFailure';

/** Result of running a validator */
export interface IValidationResult {
  readonly errors: IValidationFailure[];
  readonly isValid: boolean;

  addError(error: IValidationFailure): this;

  addChildResult(propName: string, childResult: ValidationResult): this;
}

export class ValidationResult implements IValidationResult {
  private _errors: IValidationFailure[] = [];

  static valid() {
    return new ValidationResult();
  }

  get isValid(): boolean {
    return !this._errors.length;
  }

  get errors() {
    return this._errors;
  }

  addError(error: IValidationFailure) {
    if (error) {
      this._errors.push(error);
    }
    return this;
  }

  addChildResult(propName: string, childResult: IValidationResult): this {
    childResult.errors.forEach(vFail => {
      const prefix = propName.length ? `${propName}.` : '';
      const complexPropName = `${prefix}${vFail.propertyName ?? ''}`;
      this._errors.push(new ValidationFailure(complexPropName, vFail.errorMessage, vFail.attemptedValue));
    });
    return this;
  }

  /** Merges result into this object */
  merge(result: IValidationResult) {
    result.errors.forEach(err => this._errors.push(err));
  }
}
