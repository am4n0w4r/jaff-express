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

import { Constructor, ReplaceReturnType } from '../../core/types';
import { ValidationFailure } from '../IValidationFailure';
import { IValidationResult } from '../ValidationResult';

export type ValidatorFnResult = string | string[] | ValidationFailure | undefined;
export type NormalizedValidatorFnResult = IValidationResult;

/**
 * A function to validate a value.
 * For validation to fail, it needs to
 * a) reject promise with error message or message array
 * b) return an error message or array of messages
 * c) return a validation result
 *
 * return an error, array of errors, or rejected Promise.
 */
export type ValidatorFn<TRet = ValidatorFnResult, V = any> =
  (value: V, property: string, type: Constructor) => TRet | Promise<TRet>;

export type NormalizedValidatorFn = ReplaceReturnType<ValidatorFn, NormalizedValidatorFnResult>;

export type ParameterValidatorFn<V = any> = ValidatorFn<V>;
export type ClassValidatorFn<V = any> = ValidatorFn<V>;
export type PropertyValidatorFn<V = any> = ValidatorFn<V>;
