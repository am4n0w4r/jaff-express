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

import { IValidationResult, ValidationResult } from '../ValidationResult';
import { ValidationFailure } from '../IValidationFailure';
import { NormalizedValidatorFn, ValidatorFn } from './types';


export function validationResultNormalizer(property: string, value: any, validator: ValidatorFn) {

  return new Proxy(validator, {
    async apply(target: ValidatorFn, thisArg: any, argArray?: any): Promise<ValidationResult> {

      const validationResult = ValidationResult.valid();

      await Promise.resolve(target.apply(thisArg, argArray))
        .then((result) => {
          if (!result) {
            return;
          }
          if (Array.isArray(result)) {
            result.forEach(errItem => {
              pushResult(errItem, property, value, validationResult);
            });
          } else {
            pushResult(result, property, value, validationResult);
          }
        })
        .catch(reason => {
          // Promise rejection is definitely an error, even if no message supplied
          if (Array.isArray(reason)) {
            reason.forEach(errItem => {
              pushResult(errItem, property, value, validationResult);
            });
          } else {
            pushResult(reason, property, value, validationResult);
          }
        });
      return validationResult;
    }
  }) as unknown as NormalizedValidatorFn;
}

function pushResult(result: any, name: string, value: any, validationResult: IValidationResult) {
  if (result instanceof ValidationFailure) {
    validationResult.addError(result);
  } else {
    const msg = result ? result.toString() :
      `Value '${value}' is not valid for '${name}'.`
    validationResult.addError({ propertyName: name, errorMessage: msg, attemptedValue: value });
  }
}
