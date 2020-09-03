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

import { MethodInfo, ParametersMetadataStorage } from '../metadata/metadata';
import { INextFunction, IWebRequest } from '../IWebRequest';
import { ArgumentValueResolver } from './resolvers/ArgumentValueResolver';
import {
  METAKEY_ARGUMENT_RESOLVING_OPTIONS,
  METAKEY_MODEL_BINDING_BIND_NEXT,
  METAKEY_MODEL_BINDING_BIND_REQUEST
} from './action-decorators';
import { Constructor } from '../core/types';

export class BindingContext {
  private requiredData: ParametersMetadataStorage;

  /** Index of the last processable argument */
  readonly lastArgumentIndex: number;
  readonly resolver: ArgumentValueResolver;
  readonly paramTypes: Constructor[];

  constructor(methodInfo: MethodInfo,
              public readonly req: IWebRequest,
              public readonly next: INextFunction) {
    this.requiredData = filterRequiredMetadata(methodInfo.parametersData());
    this.paramTypes = methodInfo.getParameterTypes();
    this.lastArgumentIndex = Math.max(...this.requiredData.keys());
    this.resolver = new ArgumentValueResolver(req);
  }

  getParameterMetadata(paramIndex: number) {
    return this.requiredData.get(paramIndex);
  }
}

function filterRequiredMetadata(paramsData: ParametersMetadataStorage) {
  return paramsData.filter((data) =>
    data.has(METAKEY_ARGUMENT_RESOLVING_OPTIONS) ||
    data.has(METAKEY_MODEL_BINDING_BIND_REQUEST) ||
    data.has(METAKEY_MODEL_BINDING_BIND_NEXT)
  );
}
