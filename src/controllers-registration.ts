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

import { INextFunction, IWebRequest } from './IWebRequest';
import * as express from 'express';
import { Handler, Router } from 'express';
import { RequestMethod, RouteSpec } from './RouteSpec';
import { requestHandlers, WebRequestHandler } from './RequestHandlers';
import { ControllerConstructor } from './JaffExpress';
import { MetadataKey, MethodName } from './internals';
import { Exception } from './errors/Exception';
import { metadata } from './metadata/metadata';
import { AuthorizationSpec } from './authorization/AuthorizationSpec';
import { ArgumentBinder } from './model-binding/ArgumentBinder';
import { BindingContext } from './model-binding/BindingContext';
import { ArgumentValidator } from './model-validation/ArgumentValidator';
import { ValidationResult } from './model-validation/ValidationResult';
import { dataModelClassesRegistry } from './model-binding/data-model-classes-registry';
import { ClassValidator } from './model-validation/validators/ClassValidator';
import { ErrorResult } from './request-results/ErrorResult';
import { AbstractResult } from './request-results/AbstractResult';
import { IController } from './AbstractController';

// todo: this is ugly, but shouldn't be. Ideally divide this into different independent connectable middlewares

export function registerController(controllerCtor: ControllerConstructor, app: express.Express) {
  const classInfo = metadata.for(controllerCtor);
  // Controller
  const routePrefix = classInfo.value(MetadataKey.RoutePrefix).get() as string;

  const router = Router({ mergeParams: true });

  app.use(routePrefix, router);

  // Actions
  const routeSpecs = classInfo.array(MetadataKey.RouteSpecs).get<RouteSpec>();

  routeSpecs.forEach(routeSpec => {
    if (!routeSpec) { throw new Error('Empty route spec encountered!'); }

    const subRouter = Router({ mergeParams: true });

    const authorizationSpec = classInfo.value(MetadataKey.AuthorizationSpecs).get<Map<MethodName, AuthorizationSpec>>()
      ?.get(routeSpec.methodName);

    const routeHandlers: ((req: IWebRequest, res: express.Response, next: INextFunction) => void)[] = [];

    routeHandlers.push(requestHandlers.initializationHandler());

    if (authorizationSpec) {
      // Authenticate user first
      routeHandlers.push(requestHandlers.authenticationHandler(authorizationSpec.allowUnauthenticated));
      // authenticated user comes populated with roles and permissions

      if (authorizationSpec?.scheme) {
        const h = requestHandlers.authorizationHandler(authorizationSpec.scheme);
        if (h !== null) {
          routeHandlers.push(h);
        }
      }
    }

    // Run controller method
    routeHandlers.push(async (req: IWebRequest, res: express.Response, next: express.NextFunction) => {

      const controller = new controllerCtor();
      if (!controller) {
        throw Exception.from('Could not create controller instance');
      }

      controller.init(req);

      // @ts-ignore
      const methodInstance = controller[routeSpec.methodName];
      if (typeof methodInstance !== 'function') {
        throw new Error(`Method ${routeSpec.methodName.toString()} is not a valid method of controller ${controllerCtor.name}`);
      }

      try {
        const args = [];

        {
          // Model bindings
          const methodInfo = metadata.method(controllerCtor, routeSpec.methodName);
          const bindingContext = new BindingContext(methodInfo, req, next);
          const binder = new ArgumentBinder(bindingContext);

          const argValidator = new ArgumentValidator(bindingContext);
          const classValidator = new ClassValidator();

          const requestValidationResult = ValidationResult.valid();

          try {
            for (let i = 0; i <= bindingContext.lastArgumentIndex; i++) {
              const value = await binder.bind(i);
              args.push(value);

              if (value === req || value === next) continue;

              const argValidationResult = ValidationResult.valid();

              const paramType = bindingContext.paramTypes[i];
              // as class
              if (dataModelClassesRegistry.has(paramType)) {
                const classValidationResult = await classValidator.validate(value, '', paramType);
                if (classValidationResult) {
                  argValidationResult.merge(classValidationResult);
                  requestValidationResult.merge(classValidationResult);
                }
              }
              // as param
              const paramValidationResult = await argValidator.validate(i, paramType, value);
              if (!paramValidationResult.isValid) {
                argValidationResult.merge(paramValidationResult);
                requestValidationResult.merge(paramValidationResult);
              }
            }
            req.locals.context.validationState.addValidationResult(requestValidationResult);
          } catch (err) {
            // noinspection ExceptionCaughtLocallyJS
            throw Exception.from('Failed to bind arguments', err);
          }
        }

        // todo: add values transform stage (like sanitizers, '_some ugly    text%' => 'some ugly text')

        // Controller action
        if (!req.locals.context.validationState.isValid && !routeSpec.allowNotValidState) {
          new ErrorResult(req.locals.context.validationState).sendTo(res);
        } else {
          await runControllerAction(controller, methodInstance, args, res);
        }
      } catch (err) {
        next(err);
      }
    });

    applyHandlers(subRouter, routeSpec.requestMethod, routeSpec.routePath, ...routeHandlers);

    router.use(subRouter);
  });
}

async function runControllerAction(controller: IController, methodInstance: any, args: any[], res: express.Response) {
  controller.beforeAction();

  let result;
  try {
    result = await methodInstance.apply(controller, args);
    controller.afterAction();

    if (result instanceof AbstractResult) {
      result.sendTo(res);
    } else {
      res.status(200);
      res.send(result);
    }
  } catch (err) {
    new ErrorResult(err).sendTo(res);
  }
}

function applyHandlers(router: express.Router,
                       httpMethod: RequestMethod,
                       routePath: string,
                       ...handlers: WebRequestHandler[]) {
  // switch is ugly but.. Seems like these get post etc are some kind of virtual methods, so try to find a better way.
  switch (httpMethod) {
    case 'get':
      router.get(routePath, ...handlers as Handler[]);
      break;
    case 'post':
      router.post(routePath, ...handlers as Handler[]);
      break;
    case 'patch':
      router.patch(routePath, ...handlers as Handler[]);
      break;
    case 'put':
      router.put(routePath, ...handlers as Handler[]);
      break;
    case 'delete':
      router.delete(routePath, ...handlers as Handler[]);
      break;
    default:
      throw new Error(`Can't bind '${routePath}': http method '${httpMethod}' not found`);
  }
}
