import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { ErrorCode } from '@errors/error.codes';
import { CAppContent, SupportedLanguage } from '@models/language.model';
import { frAppContent } from '@models/fr.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { enAppContent } from '@models/en.model';

const errorMessagesEn: Record<ErrorCode, string> = {
  [ErrorCode.NO_IMAGE_CAPTURED]: 'No image captured',
  [ErrorCode.INVALID_PHOTO_ID]: 'Photo not found!',
  [ErrorCode.NO_WINES_FROM_MENU_PHOTO]: 'Could not read any wines from the menu photo.',
  [ErrorCode.COULD_NOT_READ_BOTTLE_DETAILS]:
    'Could not read the wine bottle details from the photo.',
  [ErrorCode.READ_MENU_FAILED]: 'Failed to read menu',
  [ErrorCode.BOTTLE_SUMMARIZE_FAILED]: 'Failed to summarize bottle',
};

export const errorMessagesFr: Record<ErrorCode, string> = {
  [ErrorCode.NO_IMAGE_CAPTURED]: 'Aucune image capturée',
  [ErrorCode.INVALID_PHOTO_ID]: 'Photo introuvable !',
  [ErrorCode.NO_WINES_FROM_MENU_PHOTO]:
    'Impossible de déchiffrer les noms des vins sur la photo du menu.',
  [ErrorCode.COULD_NOT_READ_BOTTLE_DETAILS]:
    'Impossible de lire les informations sur la bouteille de vin sur la photo.',
  [ErrorCode.READ_MENU_FAILED]: 'Impossible de lire le menu',
  [ErrorCode.BOTTLE_SUMMARIZE_FAILED]: 'Impossible de résumer la bouteille',
};

interface ComponentContent<T> {
  en: T;
  fr: T;
  signal: WritableSignal<T>;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private currentLanguage: SupportedLanguage = 'en';

  #cBundle = signal<CAppContent>(enAppContent);

  get appContent(): Signal<CAppContent> {
    return this.#cBundle;
  }

  /**
   * @deprecated Use registerComponentContent instead
   */
  selectContent<T>(mapper: (content: CAppContent) => T): Signal<T> {
    return computed(() => mapper(this.#cBundle()));
  }

  #languageChange$ = new BehaviorSubject<SupportedLanguage>(this.currentLanguage);

  get languageChanges$(): Observable<SupportedLanguage> {
    return this.#languageChange$.asObservable();
  }

  get language(): SupportedLanguage {
    return this.currentLanguage;
  }

  set language(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    this.#cBundle.set(lang === 'en' ? enAppContent : frAppContent);
    this.componentContent.forEach((componentContent) => {
      componentContent.signal.set(lang === 'en' ? componentContent.en : componentContent.fr);
    });
  }

  componentContent = new Map<string, ComponentContent<unknown>>();

  registerComponentContent<T>(en: T, fr: T, componentName: string): Signal<T> {
    if (this.componentContent.has(componentName)) {
      // Type assertion is safe here because we always store T for a given componentName
      return (this.componentContent.get(componentName)! as ComponentContent<T>).signal;
    }

    const contentSignal: WritableSignal<T> = signal<T>(this.currentLanguage === 'en' ? en : fr);

    this.componentContent.set(componentName, {
      en,
      fr,
      signal: contentSignal,
    });

    return contentSignal;
  }

  toggleLanguage() {
    if (this.currentLanguage === 'en') {
      this.language = 'fr';
    } else {
      this.language = 'en';
    }

    this.#languageChange$.next(this.currentLanguage);
  }

  /**
   * Convenience conversion method to convert object to map for use in
   * one of the translate functions.
   */
  private parseArgs(args: object): Map<string, string> {
    const parsedArgs: Map<string, string> = new Map<string, string>();
    Object.entries(args).forEach(([key, value]) => {
      parsedArgs.set(key, String(value));
    });

    // console.log(`Parsed`, args, `as`, parsedArgs);
    return parsedArgs;
  }

  translateError(
    errorCode: ErrorCode,
    args: Map<string, string> | object = new Map<string, string>(),
  ): string {
    /**
     * This does not follow the same pattern as other content. Perhaps it would be better to
     * create an error service to "own" the error messages and then look them up based on the
     * error code.
     */
    const errMsgs = this.currentLanguage === 'en' ? errorMessagesEn : errorMessagesFr;
    const msg = errMsgs[errorCode];
    return this.interpolateArgs(msg, args);
  }

  private toArgMap(args: Map<string, string> | object) {
    let argsMap: Map<string, string>;
    if (args instanceof Map) {
      argsMap = args;
    } else {
      argsMap = this.parseArgs(args);
    }

    return argsMap;
  }

  interpolateArgs(content: string, args: Map<string, string> | object): string {
    let contentValue = content;
    const argsMap: Map<string, string> = this.toArgMap(args);
    if (argsMap.size > 0) {
      argsMap.forEach((val, key) => {
        // console.log(`Trying to replace ${key} with ${val} in ${content}`);
        contentValue = this.replaceArg(contentValue, key, val);
      });
    }
    return contentValue;
  }

  private replaceArg(content: string, argKey: string, argValue: string): string {
    // Replace all instances of {{ argKey }} with argValue
    const pattern = new RegExp(`\\{\\{\\s*${argKey}\\s*\\}}`, 'g');

    const result = content.replace(pattern, argValue);

    // console.log(`Updated ${content} using key ${argKey} and value ${argValue} and got ${result}`);
    return result;
  }
}
