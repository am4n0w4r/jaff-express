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

import { ParameterValidatorFn, PropertyValidatorFn } from '../core/types';
import { Exception } from '../../errors/Exception';
import { metadata } from '../../metadata/metadata';
import { isDefined, notNull } from './validator-functions';
import { METAKEY_ARGUMENT_VALIDATORS, METAKEY_PROPERTY_VALIDATORS } from '../../core/types';
import { pushDistinct } from '../../core/utils';


export function ValidateArg(...validators: ParameterValidatorFn[]): ParameterDecorator {
  return (target, method, parameterIndex) => {
    if (validators.some(v => typeof v !== 'function')) {
      throw Exception.from(`Validators should be functions`);
    }
    const existing = metadata.method(target.constructor, method).parameter(parameterIndex)
      .array(METAKEY_ARGUMENT_VALIDATORS);
    pushDistinct(existing, ...validators);
  };
}

/** Should work in pair with DataProp() decorator */
export function ValidateProp(...validators: PropertyValidatorFn[]): PropertyDecorator {
  return (target, propertyKey) => {
    if (validators.some(v => typeof v !== 'function')) {
      throw Exception.from(`Validators should be functions`);
    }
    const existing = metadata.for(target.constructor, propertyKey).array(METAKEY_PROPERTY_VALIDATORS).get();
    pushDistinct(existing, ...validators);
  };
}


export const IsDefined: PropertyDecorator = (target, propertyKey) => {
  const validators = metadata.for(target.constructor, propertyKey)
    .array(METAKEY_PROPERTY_VALIDATORS).get() as PropertyValidatorFn[];
  validators.push(isDefined);
};

export const NotNull: PropertyDecorator = (target, propertyKey) => {
  const validators = metadata.for(target.constructor, propertyKey)
    .array(METAKEY_PROPERTY_VALIDATORS).get() as PropertyValidatorFn[];
  validators.push(notNull);
};
