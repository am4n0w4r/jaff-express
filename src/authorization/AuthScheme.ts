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

import { IWebRequest } from '../IWebRequest';

export interface AuthScheme {
  readonly allowUnauthenticatedUser: boolean;
  validate(req: IWebRequest): Promise<string[]>;
}

export class CombinedAuthScheme implements AuthScheme {
  private readonly _schemes: AuthScheme[];
  readonly allowUnauthenticatedUser: boolean;

  constructor(...schemes: AuthScheme[]) {
    this._schemes = schemes;
    this.allowUnauthenticatedUser = !schemes.some(s => !s.allowUnauthenticatedUser)
  }

  async validate(req: IWebRequest): Promise<string[]> {
    const errors = [];
    for (const scheme of this._schemes) {
      const schemeErrors = await scheme.validate(req);
      errors.push(...schemeErrors);
      if (errors.length) {
        break;
      }
    }
    return errors;
  }

}
