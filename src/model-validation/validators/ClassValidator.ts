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

import { Constructor, METAKEY_CLASS_VALIDATOR, METAKEY_PROPERTY_VALIDATORS } from '../../core/types';
import { dataModelClassesRegistry } from '../../model-binding/data-model-classes-registry';
import { metadata } from '../../metadata/metadata';
import { ClassValidatorFn, PropertyValidatorFn } from '../core/types';
import { validationResultNormalizer } from '../core/utils';
import { BindableClassProperty, METAKEY_BINDABLE_CLASS_PROPERTIES } from '../../model-binding/model-decorators';
import { IValidationResult, ValidationResult } from '../ValidationResult';

export class ClassValidator {

  async validate(value: any, propertyName: string | symbol, ctor: Constructor): Promise<IValidationResult> {
    const validationResult = ValidationResult.valid();

    propertyName = propertyName ? propertyName.toString() : '';

    const classMetadata = metadata.for(ctor);

    const customClassValidator = classMetadata.value(METAKEY_CLASS_VALIDATOR).get() as ClassValidatorFn;

    if (customClassValidator) {
      const normalizedValidator = validationResultNormalizer(propertyName.toString(), value, customClassValidator);
      return normalizedValidator(value, propertyName.toString(), ctor);
    }

    // loop through defined properties and validate them recursively
    const bindableProperties = metadata.for(ctor)
      .array(METAKEY_BINDABLE_CLASS_PROPERTIES).get() as BindableClassProperty[];
    for (const prop of bindableProperties) {
      const namePrefix = propertyName.length ? `${propertyName}.` : '';
      const propName = `${namePrefix}${prop.name.toString()}`;
      const propValue = value[prop.name];

      if (propValue === undefined || propValue === null) {
        continue;
      }

      const propResult = await this.validateProperty(ctor, prop, propName, propValue);
      validationResult.addChildResult(propertyName.toString(), propResult);
    }


    return validationResult;
  }

  private async validateProperty(classCtor: Constructor,
                                 prop: BindableClassProperty,
                                 nestedPropName: string, propValue: any) {
    if (isRegisteredClass(prop.ctor)) {
      return this.validate(propValue, nestedPropName, prop.ctor);
    } else {
      const result = ValidationResult.valid();

      const validators = metadata.for(classCtor, prop.name)
        .array(METAKEY_PROPERTY_VALIDATORS).get() as PropertyValidatorFn[];
      for (const validatorFn of validators) {
        const normalizedValidator = validationResultNormalizer(prop.name.toString(), propValue, validatorFn);
        const validatorResult = await normalizedValidator(propValue, nestedPropName, prop.ctor);
        result.merge(validatorResult);
      }
      return result;
    }
  }
}

function isRegisteredClass(ctor: Constructor) {
  return dataModelClassesRegistry.has(ctor);
}
