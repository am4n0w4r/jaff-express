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

import { dataModelClassesRegistry } from './data-model-classes-registry';
import { AnyConstructor, Constructor, METAKEY_CLASS_VALIDATOR, METAKEY_PROPERTY_VALIDATORS } from '../core/types';
import { metadata } from '../metadata/metadata';
import { ClassValidatorFn, PropertyValidatorFn } from '../model-validation/core/types';
import { isConstructorOfIterable, isCustomClassConstructor } from '../core/utils';
import { Exception } from '../errors/Exception';
import { collectionResolvers } from './resolvers/collection-resolvers';


export const METAKEY_BINDABLE_CLASS_PROPERTIES = 'binding:bindable-class-properties';


export interface BindableClassProperty {
  name: string | symbol;
  ctor: AnyConstructor;
  itemCtor?: AnyConstructor;
}

export interface DataModelOptions {
  validateWith?: ClassValidatorFn;
}

/**
 * A model should be decorated with this decorator for it to be added to registry
 * and processed
 */
export function DataModel(options?: DataModelOptions): ClassDecorator {
  return (targetConstructor) => {
    dataModelClassesRegistry.add(targetConstructor as unknown as Constructor);

    if (options?.validateWith) {
      metadata.for(targetConstructor).value(METAKEY_CLASS_VALIDATOR).set(options.validateWith);
    }
  };
}

interface DataPropOptions {
  /** Custom validator overrides any other set decorating validators */
  customValidator?: PropertyValidatorFn;
  /** If property is iterable, specify constructor of an item */
  itemCtor?: AnyConstructor;
}

/** Decorate model properties with this for model binding to work */
export const DataProp = (options?: DataPropOptions): PropertyDecorator => {
  return function (target: object, propertyKey: string | symbol) {
    const classCtor = target.constructor as Constructor;
    const propInfo = metadata.for(target, propertyKey);
    const propCtor = propInfo.getDesignType();

    const methodPropDescriptor = arguments[2];
    if (propCtor.name === 'Function' || methodPropDescriptor) {
      throw new Error(`Binding to function is not allowed: ${propertyKey.toString()}`);
    }

    const bindableProperties = metadata.for(classCtor).array(METAKEY_BINDABLE_CLASS_PROPERTIES)
      .get() as BindableClassProperty[];

    const bindingData: BindableClassProperty = { name: propertyKey, ctor: propCtor };
    bindableProperties.push(bindingData);

    if (isConstructorOfIterable(propCtor)) {
      if (typeof options?.itemCtor !== 'function') {
        throw Exception.from(
          `Data prop "${classCtor.name}.${propertyKey.toString()}" has iterable type.` +
           ' Specify item constructor in binding options.'
        );
      }
      if (!collectionResolvers.has(propCtor)) {
        throw Exception.from(
          `Data prop "${classCtor.name}.${propertyKey.toString()}" has iterable type,` +
          ` but no resolver found for iterable type ${propCtor.name}. Try to add it.`
        );
      }
      bindingData.itemCtor = options?.itemCtor;
    }

    if (isCustomClassConstructor(propCtor)) {
      dataModelClassesRegistry.add(propCtor);
    }

    if (options?.customValidator) {
      const validators = propInfo.array(METAKEY_PROPERTY_VALIDATORS).get() as PropertyValidatorFn[];
      validators.length = 0;
      validators.push(options.customValidator);
    }
  };
};
