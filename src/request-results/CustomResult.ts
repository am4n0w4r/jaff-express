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

import { AbstractResult } from './AbstractResult';
import { Response } from 'express';

type Customizer = (res: Response) => void;

/**
 * A result that calls a user-defined response customizing function.
 * Add custom headers, body, etc.
 */
export class CustomResult extends AbstractResult {

  constructor(private customizer: Customizer) { super(); }

  sendTo(res: Response): void {
    if (this.customizer) {
      this.customizer(res);
    }
  }
}

export function customResult(customizer: Customizer): CustomResult {
  return new CustomResult(customizer);
}