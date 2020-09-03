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

import { Collection, collectionResolvers } from './collection-resolvers';
import { AnyConstructor, Constructor } from '../../core/types';

export class CollectionResolver {

  private readonly itemResolver: (rawItem: any, itemCtor: AnyConstructor) => any;

  constructor(itemResolver: (rawItem: any, itemCtor: AnyConstructor) => any) {
    this.itemResolver = itemResolver.bind(this);
  }

  resolve(collectionCtor: Constructor, rawValue: Iterable<any>, itemCtor?: AnyConstructor): Collection | undefined {

    const resolver = collectionResolvers.get(collectionCtor);
    if (resolver) {
      const collection = resolver.instantiate();

      if (collection) {
        for (const rawItem of rawValue) {
          const resolvedItem = itemCtor ? this.itemResolver(rawItem, itemCtor) : undefined;
          resolver.addItem(collection, resolvedItem);
        }
        return collection;
      }
    }
  }
}
