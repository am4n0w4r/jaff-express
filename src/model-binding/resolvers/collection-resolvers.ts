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

import { Constructor } from '../../core/types';

export type Collection<T = any> = Iterable<T>;
export type CollectionConstructor<T extends Collection = any> = Constructor<T>;
export type ResolverObject = { instantiate(): Collection, addItem(collection: any, item: any): void };

export const collectionResolvers = new Map<CollectionConstructor, ResolverObject>([
  [Array, {
    instantiate: () => [],
    addItem: (arr: any[], item: any) => arr.push(item)
  }],
  [Set, {
    instantiate: () => new Set(),
    addItem: (set: Set<any>, item: any) => set.add(item)
  }],
  [Map, {
    instantiate: () => new Map(),
    addItem: (map: Map<any, any>, item) => map.set(item[0], item[1])
  }]
]);
