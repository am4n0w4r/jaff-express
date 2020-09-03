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

import { metadata } from '../metadata/metadata';
import { BindingSource } from './BindingSource';
import { AnyConstructor } from '../core/types';
import { collectionResolvers } from './resolvers/collection-resolvers';
import { ArgumentResolvingOptions } from './resolvers/ArgumentValueResolver';
import { isConstructorOfIterable } from '../core/utils';


export const METAKEY_ARGUMENT_RESOLVING_OPTIONS = 'argument-resolving-options';
export const METAKEY_MODEL_BINDING_BIND_REQUEST = 'model-binding:request';
export const METAKEY_MODEL_BINDING_BIND_NEXT = 'model-binding:next';


/**
 * Binds Request to parameter
 */
export function BindRequest(): ParameterDecorator {
  return (target, method, parameterIndex) => {
    metadata.method(target, method).parameter(parameterIndex).setData(METAKEY_MODEL_BINDING_BIND_REQUEST, true);
  };
}

/**
 * Binds next() function to parameter<br>
 * <i>Note: This is not recommended to use</i>
 */
export function BindNextFn(): ParameterDecorator {
  return (target, method, parameterIndex) => {
    metadata.method(target, method).parameter(parameterIndex).setData(METAKEY_MODEL_BINDING_BIND_NEXT, true);
  };
}

/**
 * Binds value from url path parameters to argument
 * @param name of the value to bind
 * @param options
 */
export function BindFromPrm(name: string, options?: ParameterBindingOptions): ParameterDecorator {
  return produceDecorator(name, BindingSource.UrlParams, options);
}

/**
 * Binds value from url query to parameter
 * @param name of the value to bind
 * @param options
 */
export function BindFromQry(name: string, options?: ParameterBindingOptions): ParameterDecorator {
  return produceDecorator(name, BindingSource.UrlQuery, options);
}

/**
 * Binds value from either request body, url params, or url query to parameter<br>
 * <i>Note: An error will be thrown if value is duplicated in different sources</i>
 * @param name of the value to bind
 * @param options
 */
export function BindFromAny(name: string, options?: ParameterBindingOptions): ParameterDecorator {
  return produceDecorator(name, undefined, options);
}

/**
 * Binds value from request body to parameter
 * @param name of the value to bind
 * @param options
 */
export function BindFromBdy(name: string, options?: ParameterBindingOptions): ParameterDecorator {
  return produceDecorator(name, BindingSource.RequestBody, options);
}

/** Not supported yet */
export function BindFromHeader(name: string,
                               headerName: string,
                               options?: ParameterBindingOptions): ParameterDecorator {
  throw new Error('Not supported yet');
}


interface ParameterBindingOptions {
  /** If parameter is iterable, specify constructor for items here */
  itemType?: AnyConstructor;
}


function produceDecorator(name: string, source?: BindingSource, options?: ParameterBindingOptions): ParameterDecorator {
  return (target, method, parameterIndex) => {
    if (isConstructorOfIterable(target.constructor as AnyConstructor) &&
      !collectionResolvers.has(target.constructor as AnyConstructor)) {
      throw new Error(`Binding to collection of type ${target.constructor.name} is not supported. \
       Consider creating a collection resolver for this type and add it to collection resolvers.`);
    }

    const methodInfo = metadata.method(target.constructor, method);
    methodInfo.parameter(parameterIndex).setName(name);

    const paramType = methodInfo.parameter(parameterIndex).type();
    if (!paramType) { throw new Error(`Error binding parameter ${name}: could not determine its type`); }

    methodInfo.parameter(parameterIndex).setData<ArgumentResolvingOptions>(METAKEY_ARGUMENT_RESOLVING_OPTIONS, {
      name,
      ctor: paramType,
      itemCtor: options?.itemType,
      source
    });
  };
}
