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

import { MetadataKey } from './internals';
import { RequestMethod, RouteSpec } from './RouteSpec';
import { Exception } from './errors/Exception';
import { metadata } from './metadata/metadata';

export const Controller = (routePrefix?: string): ClassDecorator => {
  return (target) => {
    if (routePrefix) {
      metadata.for(target).value(MetadataKey.RoutePrefix).set(routePrefix);
    }
  };
};

interface IActionOptions {
  /**
   * If true, will run action even if validation state is not valid.
   * You will have to manually check if request validation state is valid inside action.
   */
  allowNotValid?: boolean;
}

export const Get = (path: string, o?: IActionOptions): MethodDecorator => {
  return produceDecorator('get', path);
};

export const Post = (path: string, o?: IActionOptions): MethodDecorator => {
  return produceDecorator('post', path);
};

export const Put = (path: string, o?: IActionOptions): MethodDecorator => {
  return produceDecorator('put', path);
};

export const Patch = (path: string, o?: IActionOptions): MethodDecorator => {
  return produceDecorator('patch', path);
};


function produceDecorator(httpMethod: RequestMethod, path: string, o?: IActionOptions): MethodDecorator {
  return (target, method: string | symbol, propDescriptor): void => {
    if (!propDescriptor) {
      throw Exception.from(`You can apply controller decorators only to methods, and "${method.toString()}" seems to be a property`);
    }

    const routes = metadata.for(target.constructor).array(MetadataKey.RouteSpecs).get<RouteSpec>();
    routes.push({
      methodName: method,
      requestMethod: httpMethod,
      routePath: path,
      allowNotValidState: o?.allowNotValid
    });
  };
}
