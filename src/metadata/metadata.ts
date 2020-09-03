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

import { Constructor } from '../core/types';


export const META_PARAM_TYPES = 'design:paramtypes';
export const META_CUSTOM_PARAMS_DATA = 'custom:parametersdata';
export const META_PARAM_NAME = 'custom:design:paramname';

export type ParameterMetadata = Omit<Map<string, any>, 'get'> & { get<V>(key: string): V | undefined };
export type ParametersMetadataStorage = Map<number, ParameterMetadata> & {
  filter(predicate: (value: ParameterMetadata, paramIndex: number) => boolean): ParametersMetadataStorage;
};

export interface MethodInfo {
  parametersData(): ParametersMetadataStorage;

  parametersDataByKey<V>(key: string): Map<number, V>;

  getParameterTypes(): Constructor[];

  parameter(index: number): ParameterInfo;
}

export interface ParameterInfo {
  type(): Constructor;

  getData<V>(key: string): V;

  getOrSetDefault<V>(key: string, defaultValue: V): V;

  setData<V>(key: string, value: V): void;

  setName(name: string): void;

  getName(): (string | undefined);

  array<V>(key: string): V[];
}

// todo: this looks overall good but.. API is still like a mess to me. Make simpler
export const metadata = {
  for<TProp extends (string | symbol | undefined)>(target: object | Constructor, propertyKey?: TProp) {
    return {
      getDesignType() {
        // @ts-ignore
        return Reflect.getMetadata('design:type', target, propertyKey);
      },
      value(key: any) {
        return {
          get<V>(own?: boolean): V {
            const fn = own ? Reflect.getOwnMetadata : Reflect.getMetadata;
            // @ts-ignore
            return fn(key, target, propertyKey) as V;
          },
          getOrSetDefault<V>(defaultValue: V, own?: boolean): V {
            const value: V = this.get(own);
            if (value) {
              return value;
            } else {
              this.set(defaultValue);
              return defaultValue;
            }
          },
          set(value: any) {
            // @ts-ignore
            return Reflect.defineMetadata(key, value, target, propertyKey);
          }
        };
      },
      array(key: string) {
        return {
          get<V>(own?: boolean): V[] {
            const getFn = own ? Reflect.getOwnMetadata : Reflect.getMetadata;
            // @ts-ignore
            let arr = getFn(key, target, propertyKey) as V[];
            if (!arr) {
              arr = [];
              // @ts-ignore
              Reflect.defineMetadata(key, arr, target, propertyKey);
            }
            return arr;
          }
        };
      },
      getKeys(own?: boolean) {
        const fn = own ? Reflect.getOwnMetadataKeys : Reflect.getMetadataKeys;
        // @ts-ignore
        return fn(target, propertyKey);
      }
    };
  },
  method(target: object | Constructor, method: string | symbol) {
    return {
      parametersData() {
        const ctor = typeof target === 'function' ? target : target.constructor;
        return getParametersStorage(ctor as Constructor, method);
      },
      parametersDataByKey<V>(key: string) {
        const storage = this.parametersData();
        return new Map<number, V>(
          [...storage]
            .filter(([_, v]) => v && v.has(key))
            .map(([k, v]) => [k, v.get(key) as V])
        );
      },
      getParameterTypes() {
        const proto = typeof target === 'function' ? target.prototype : target;
        return Reflect.getMetadata(META_PARAM_TYPES, proto, method) as Constructor[];
      },
      parameter(index: number) {
        return {
          type() {
            const proto = typeof target === 'function' ? target.prototype : target;
            return Reflect.getMetadata(META_PARAM_TYPES, proto, method)[index] as Constructor;
          },
          getData<V>(key: string) {
            const ctor = typeof target === 'function' ? target : target.constructor;
            const storage = getParametersStorage(ctor as Constructor, method);
            let paramMeta = storage.get(index);
            if (!paramMeta) {
              paramMeta = new Map<string, any>();
              storage.set(index, paramMeta);
            }
            return paramMeta.get(key) as V;
          },
          getOrSetDefault<V>(key: string, defaultValue: V): V {
            const value: V = this.getData(key);
            if (value) {
              return value;
            } else {
              this.setData(key, defaultValue);
              return defaultValue;
            }
          },
          setData<V>(key: string, value: V) {
            const ctor = typeof target === 'function' ? target : target.constructor;
            const storage = getParametersStorage(ctor as Constructor, method);
            let paramMeta = storage.get(index);
            if (!paramMeta) {
              paramMeta = new Map<string, any>();
              storage.set(index, paramMeta);
            }
            paramMeta.set(key, value);
          },
          setName(name: string) {
            this.setData(META_PARAM_NAME, name);
          },
          getName(): string | undefined {
            return this.getData(META_PARAM_NAME);
          },
          array<V>(key: string): V[] {
            let arr = this.getData(key);
            if (!arr) {
              arr = [];
              this.setData(key, arr);
            }
            return arr as V[];
          }
        } as ParameterInfo;
      }
    } as MethodInfo;
  }
};

function getParametersStorage(ctor: Constructor, method: string | symbol): ParametersMetadataStorage {
  let storage = Reflect.getMetadata(META_CUSTOM_PARAMS_DATA, ctor, method);
  if (!storage) {
    storage = new Map<number, Map<string, any>>();
    storage.filter = filter;
    Reflect.defineMetadata(META_CUSTOM_PARAMS_DATA, storage, ctor, method);
  }
  return storage;
}

const filter = function (this: ParametersMetadataStorage,
                         predicate: (value: ParameterMetadata, paramIndex: number) => boolean)
  : ParametersMetadataStorage {
  const filtered = new Map<number, ParameterMetadata>(
    [...this].filter(([k, v]) => v && predicate(v, k))
  ) as ParametersMetadataStorage;
  filtered.filter = filter;
  return filtered;
};
