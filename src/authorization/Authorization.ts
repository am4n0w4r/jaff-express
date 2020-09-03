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

import { MetadataKey, MethodName } from '../internals';
import { AuthorizationSpec } from './AuthorizationSpec';
import { AuthScheme } from './AuthScheme';
import { metadata } from '../metadata/metadata';


/**
 * If no arguments passed, allows access only to authenticated users.
 *
 * Otherwise, checks authorization using specified scheme<br>
 * Multiple <i>decorators</i> not allowed
 */
export const Authorize = (scheme?: AuthScheme): MethodDecorator => {

  return (target: object, methodName: MethodName): void => {
    // todo: store all method-related metadata as method metadata, not just in constructor
    const authSpecs = metadata.for(target.constructor).value(MetadataKey.AuthorizationSpecs)
        .getOrSetDefault(new Map<MethodName, AuthorizationSpec>());
    if (!authSpecs.has(methodName)) {
      authSpecs.set(methodName, {
        controllerMethod: methodName,
        allowUnauthenticated: scheme?.allowUnauthenticatedUser,
        scheme
      });
    } else {
      throw new Error('Multiple decorators are not allowed');
    }
  };
};

//export const AllowAnonymous
