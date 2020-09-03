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

import { BindingContext } from './BindingContext';
import {
  METAKEY_ARGUMENT_RESOLVING_OPTIONS,
  METAKEY_MODEL_BINDING_BIND_NEXT,
  METAKEY_MODEL_BINDING_BIND_REQUEST
} from './action-decorators';
import { ArgumentResolvingOptions } from './resolvers/ArgumentValueResolver';

export class ArgumentBinder {

  constructor(private readonly bindingContext: BindingContext) {
  }

  async bind(index: number): Promise<any> {
    const paramData = this.bindingContext.getParameterMetadata(index);
    if (paramData) {
      const resolvingOptions = paramData.get(METAKEY_ARGUMENT_RESOLVING_OPTIONS) as ArgumentResolvingOptions;
      if (resolvingOptions) {
        return this.bindingContext.resolver.resolve(resolvingOptions);
      } else if (paramData.has(METAKEY_MODEL_BINDING_BIND_REQUEST)) {
        return this.bindingContext.req;
      } else if (paramData.has(METAKEY_MODEL_BINDING_BIND_NEXT)) {
        return this.bindingContext.next;
      }
    } else return undefined;
  }
}
