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

import { AnyConstructor, Constructor } from './types';

export function pushDistinct<T>(arr: T[], ...elements: T[]) {
  if (!Array.isArray(arr)) {
    throw new Error('"This" can only be an array');
  }

  elements.forEach(e => {
    if (arr.indexOf(e) < 0) {
      arr.push(e);
    }
  });

  return arr.length;
}

export function isConstructorOfIterable(ctor: AnyConstructor, treatStringAsIterable = false) {
  return ctor && (treatStringAsIterable || ctor !== String) && ctor.prototype
    && typeof ctor.prototype[Symbol.iterator] === 'function';
}

export function isIterable(obj: any, treatStringAsIterable?: boolean): boolean {
  return obj && (treatStringAsIterable || typeof obj !== 'string') && typeof obj[Symbol.iterator] === 'function';
}

// @ts-ignore
export const builtInConstructors: (new(...a: any[]) => any)[] = Object.freeze(
  [String, Number, Boolean, Object, Array, Map, Set]
);

export function isCustomClassConstructor(ctor: Constructor) {
  return builtInConstructors.indexOf(ctor) < 0;
}

export function trimStart(str: string, symbolsToTrim?: string) {
  if (!str) { return str; }
  let index = 0;
  symbolsToTrim = symbolsToTrim || ' ';
  while (symbolsToTrim.includes(str.charAt(index))) { index++; }
  return str.substring(index);
}

export function trimEnd(str: string, symbolsToTrim?: string) {
  if (!str) { return str; }
  let index = str.length - 1;
  symbolsToTrim = symbolsToTrim || ' ';
  while (symbolsToTrim.includes(str.charAt(index))) { index--; }
  return str.substring(0, index + 1);
}

export function trim(str: string, symbolsToTrim?: string) {
  return trimEnd(trimStart(str, symbolsToTrim), symbolsToTrim);
}
