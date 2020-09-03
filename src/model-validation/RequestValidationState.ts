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

import { IValidationResult } from './ValidationResult';
import { trim } from '../core/utils';

export class RequestValidationState {
  private _errors = new Map<string, string[]>();

  get isValid() {
    return this._errors.size === 0 ||
      [...this._errors.values()].every(propErrors => {
        !propErrors.length;
      });
  }

  get errors() {
    return new Map<string, string[]>(this._errors);
  }

  addError(error: string, prop?: string) {
    prop = this.normalizeProp(prop);
    let errors = this._errors.get(prop);
    if (!errors) {
      errors = [];
      this._errors.set(prop, errors);
    }
    errors.push(error);
  }

  addValidationResult(result: IValidationResult, prop?: string) {
    const prefix = this.getPrefix(prop);
    result.errors.forEach(err => {
      const fullProp = trim(err.propertyName ? `${prefix}.${err.propertyName}` : prefix, '.');
      let errors = this._errors.get(fullProp);
      if (!errors) {
        errors = [];
        this._errors.set(fullProp, errors);
      }
      errors.push(err.errorMessage);
    });
  }

  remove(prop: string) {
    return this._errors.delete(prop);
  }

  clear() {
    return this._errors.clear();
  }

  private normalizeProp(prop?: string): string {
    return prop ?? '';
  }

  private getPrefix(prop?: string) {
    return prop ? `${prop}.` : '';
  }
}
