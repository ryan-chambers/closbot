import { inject } from '@angular/core';
import { ResponseLogService } from './response-log.service';

export enum ResponseContext {
  CHAT_RESPONSE = 'CHAT_RESPONSE',
  WINE_MENU_TEXT = 'WINE_MENU_TEXT',
  WINE_MENU_RECOMMENDATION = 'WINE_MENU_RECOMMENDATION',
  RAG_CONTEXT = 'RAG_CONTEXT',
  USER_MESSAGE = 'USER_MESSAGE',
  WINE_BOTTLE_SUMMARY = 'WINE_BOTTLE_SUMMARY',
  WINE_BOTTLE_IMAGE_DETAILS = 'WINE_BOTTLE_IMAGE_DETAILS',
}

export type TrackResponseOptions<T> = {
  context: ResponseContext;
  /**
   * Optional serializer to convert a non-string payload into a string for logging.
   * If not provided the decorator will attempt JSON.stringify and skip logging on failure.
   */
  serializer?: (value: T) => string | null | undefined;
};

/**
 * Method decorator that records the return value of the decorated method into ResponseLogService.
 * It accepts either a `ResponseContext` enum or an options object that can include a serializer
 * for non-string payloads. For objects the default behavior is to JSON.stringify them.
 *
 * Usage:
 *  @TrackResponse(ResponseContext.CHAT_RESPONSE)
 *  or
 *  @TrackResponse({ context: ResponseContext.RAG_CONTEXT, serializer: v => v.text })
 *
 * <strong>Note:</strong> This decorator requires that the decorated method's class has
 * a `responseLogService` property that is an instance of `ResponseLogService`. This can be
 * provided via Angular's dependency injection or manually assigned.
 */
export function TrackResponse(contextOrOptions: ResponseContext | TrackResponseOptions<any>) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    if (typeof original !== 'function') {
      return;
    }

    // normalize inputs
    const options: TrackResponseOptions<any> =
      typeof contextOrOptions === 'object'
        ? (contextOrOptions as TrackResponseOptions<any>)
        : { context: contextOrOptions as ResponseContext };

    const serializer = options.serializer;

    descriptor.value = function (...args: any[]) {
      // Call the original method
      try {
        const result = original.apply(this, args);

        // Prefer an instance-level ResponseLogService (this.responseLogService)
        // if available, otherwise fall back to DI-based getter.
        // Use a safe any cast so TypeScript won't complain about unknown 'responseLogService' on `this`.
        const logger: ResponseLogService | null =
          this && (this as any).responseLogService
            ? (this as any).responseLogService
            : getResponseLogService();

        const trySerialize = (val: any): string | undefined => {
          if (typeof val === 'string') {
            return val;
          }
          if (serializer) {
            try {
              return serializer(val) ?? undefined;
            } catch (e) {
              console.warn('TrackResponse: serializer threw error', e);
              return undefined;
            }
          }
          try {
            return JSON.stringify(val);
          } catch (e) {
            return undefined;
          }
        };

        if (result && typeof result.then === 'function') {
          return result.then((r: any) => {
            const text = trySerialize(r);
            if (typeof text === 'string') {
              logger?.add(text, options.context);
            }
            return r;
          });
        }

        const text = trySerialize(result);
        if (typeof text === 'string') {
          logger?.add(text, options.context);
        }

        return result;
      } catch (err) {
        // rethrow after optional logging
        throw err;
      }
    };

    return descriptor;
  };
}

function getResponseLogService(): ResponseLogService | null {
  // Prefer the injector from Angular core if available at runtime.
  // We try to use the global injector via `inject` — this works when
  // decorators execute in an Angular-initialized environment. As a fallback,
  // try reading from (window as any).ng ? Not implemented here — return null.
  try {
    return inject(ResponseLogService);
  } catch (e) {
    console.warn('TrackResponse: no Angular injection context; cannot log response');
    return null;
  }
}
