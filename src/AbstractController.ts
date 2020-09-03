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

import { IWebRequest } from './IWebRequest';
import { Exception } from './errors/Exception';
import { RequestValidationState } from './model-validation/RequestValidationState';


export interface IController<TUser = any> {
  [key: string]: any;

  validationState: RequestValidationState;
  user?: TUser;

  init(req: IWebRequest): void;

  beforeAction(): void;

  afterAction(): void;
}


export abstract class AbstractController<TUser = any> implements IController<TUser> {
  private _req: IWebRequest<TUser> | null = null;

  get user() {
    this.ensureInitialized();
    return this._req!.user;
  }

  get validationState() {
    this.ensureInitialized();
    return this._req!.locals.context.validationState;
  }

  public init(req: IWebRequest<TUser>) {
    this._req = req;
  }

  beforeAction(): void {}

  afterAction(): void {}

  private ensureInitialized() {
    if (!this._req) {
      throw Exception.from('Controller was not initialized!');
    }
  }
}
