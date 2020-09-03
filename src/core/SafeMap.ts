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

/**
 * A map that always return a value.
 * If non-existent key is queried, a default value <i>is set</i> and then returned
 */
export interface SafeMap<K, V> extends Map<K, V> {
  /** Returns stored value or save and return default one if not present */
  get(key: K): V;
}

export function newSafeMap<K, V>(defaultValueProducer: () => V, entries?: [K, V][]): SafeMap<K, V> {
  const map = new Map<K, V>(entries);
  return new Proxy(map, {
    get(target: Map<K, V>, p: PropertyKey): any {
      const prop = Reflect.get(target, p);
      if (typeof prop === 'function') {
        if (p === 'get') {
          return (key: K) => {
            const realGetFn = prop.bind(target);
            const value = realGetFn(key);
            if (value === undefined) {
              const realSetFn = Reflect.get(target, 'set').bind(target);
              realSetFn(key, defaultValueProducer());
            }
            return realGetFn(key);
          };
        } else return prop.bind(target);
      } else return prop;
    }
  }) as SafeMap<K, V>;
}
