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

import { IWebRequest } from '../../IWebRequest';
import { BindingSource } from '../BindingSource';
import { CollectionResolver } from './CollectionResolver';
import { primitiveValueResolvers } from './primitive-value-resolvers';
import { Exception } from '../../errors/Exception';
import { dataModelClassesRegistry } from '../data-model-classes-registry';
import { METAKEY_BINDABLE_CLASS_PROPERTIES, BindableClassProperty } from '../model-decorators';
import { AnyConstructor } from '../../core/types';
import { metadata } from '../../metadata/metadata';
import { isConstructorOfIterable } from '../../core/utils';
import { Collection } from './collection-resolvers';


export interface ArgumentResolvingOptions {
  /** Name of the argument/property to bind to */
  name: string;

  /**
   * Constructor function to instantiate argument/property<br>
   */
  ctor: AnyConstructor;

  /**
   * If a parameter is an array and is decorated with @itemType decorator,<br>
   * then this holds the constructor to instantiate an array item
   */
  itemCtor?: AnyConstructor;

  /**
   * Request collection to look for a raw value.<br>
   */
  source?: BindingSource;
}


/**
 * Resolves argument value based on binding data
 */
export class ArgumentValueResolver {
  readonly collectionResolver = new CollectionResolver(this.resolveSingleValue);

  constructor(private req: IWebRequest) {}

  async resolve(resolvingOptions?: ArgumentResolvingOptions): Promise<any> {
    if (!resolvingOptions) { return; }

    try {
      const rawValue = this.getRawValue(resolvingOptions.name, resolvingOptions.source);

      return this.resolveSingleValue(rawValue, resolvingOptions.ctor);
    } catch (err) {
      throw Exception.from(`Failed to bind parameter "${resolvingOptions.name}"`, err);
    }
  }

  private resolveSingleValue(raw: any, ctor: AnyConstructor, itemCtor?: AnyConstructor)
    : Collection | any | undefined {

    const isIterableParameter = isConstructorOfIterable(ctor);
    if (isIterableParameter) {
      if (raw === undefined || raw === null) { return raw; }
      if (!itemCtor) { return undefined; }

      return this.collectionResolver.resolve(ctor, raw, itemCtor);
    }

    const primitiveResolver = primitiveValueResolvers.get(ctor);
    if (primitiveResolver) {
      return primitiveResolver(raw);
    }
    const isClassValue = dataModelClassesRegistry.has(ctor);
    if (isClassValue) {
      return this.constructClassValue(ctor, raw);
    }
  }

  private constructClassValue(ctor: AnyConstructor, raw: any) {
    if (raw === undefined || raw === null) {
      return raw;
    }

    const value = Reflect.construct(ctor, []);
    if (!value) {
      throw Exception.from(`Failed to instantiate ${ctor} as a class`);
    }

    let rawObj;
    if (typeof raw === 'object') {
      rawObj = raw;
    } else if (typeof raw === 'string') {
      rawObj = JSON.parse(raw);
    } else {
      throw Exception.from(`Failed to bind ${raw} to a class`);
    }

    const propertyBindings = new Set<BindableClassProperty>(
      metadata.for(ctor).array(METAKEY_BINDABLE_CLASS_PROPERTIES).get()
    );
    for (const bindingData of propertyBindings) {
      const propValue = this.resolveSingleValue(rawObj[bindingData.name], bindingData.ctor, bindingData.itemCtor);
      Reflect.set(value, bindingData.name, propValue);
    }

    return value;
  }

  // todo: merge objects in case a class object binds from any, without name,
  //  and its properties can have different sources
  private getRawValue(key: string, src?: BindingSource) {
    switch (src) {
      case BindingSource.UrlParams:
        return keyedOrSelf(this.req.params, key);
      case BindingSource.RequestBody:
        return keyedOrSelf(this.req.body, key);
      case BindingSource.UrlQuery:
        return keyedOrSelf(this.req.query, key);
    }

    let result;
    let tmpValue = keyedOrSelf(this.req.query, key);
    let count = 0;
    if (tmpValue !== undefined) {
      count++;
      result = tmpValue;
    }
    tmpValue = keyedOrSelf(this.req.body, key);
    if (tmpValue !== undefined && tmpValue !== result) {
      count++;
      result = tmpValue;
    }
    tmpValue = keyedOrSelf(this.req.params, key);
    if (tmpValue !== undefined && tmpValue !== result) {
      count++;
      result = tmpValue;
    }
    if (count > 1) {
      throw Exception.from(`Multiple request values found for "${key}"`);
    }
    return result;
  }
}

function valueOrEmptyObject(value: any) {
  return value ?? {};
}

function keyedOrSelf(src: any, key?: string) {
  return key ? valueOrEmptyObject(src)[key] : src;
}
