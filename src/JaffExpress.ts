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

import { Express, Handler } from 'express';
import { IController } from './AbstractController';
import { registerController } from './controllers-registration';
import { CollectionConstructor, collectionResolvers, ResolverObject } from './model-binding/resolvers/collection-resolvers';
import { PrimitiveValueResolver, primitiveValueResolvers } from './model-binding/resolvers/primitive-value-resolvers';
import { AnyConstructor } from './core/types';


export type ControllerConstructor = new(...args: any[]) => IController;


interface JaffExpressOptions {
  /**
   * We should register controllers manually, because for automatic registration
   * we should either manually import all the controllers or keep them all in specified places,
   * and these are more like drawbacks.
   */
  controllers: ControllerConstructor[];
  modelBinding?: {
    /**
     * You can override standard collection resolvers behavior or add custom resolvers using this property
     */
    customCollectionResolvers?: Map<CollectionConstructor, ResolverObject>;
    customValueResolvers?: Map<AnyConstructor, PrimitiveValueResolver>;
    middlewares?: Handler[];
  }
}

export const environment = {
  isLocal: process.env.NODE_ENV === 'local'
};

/**
 * Just Another Framework For Express
 */
export class JaffExpress {
  /**
   * Remember about app.use() order, because this calls app.use() internally.
   * @param app
   * @param options required object which is used to customize some framework behaviors
   */
  static init(app: Express, options: JaffExpressOptions) {
    return new JaffExpress(app, options);
  }

  private constructor(private app: Express, options: JaffExpressOptions) {
    (options.controllers ?? []).forEach(ctor => registerController(ctor, this.app));
    if (options.modelBinding?.customCollectionResolvers?.size) {
      options.modelBinding?.customCollectionResolvers
        .forEach((v, k) => collectionResolvers.set(k, v));
    }
    if (options.modelBinding?.customValueResolvers?.size) {
      options.modelBinding?.customValueResolvers
        .forEach((v, k) => primitiveValueResolvers.replace(k, v));
    }
  }
}


