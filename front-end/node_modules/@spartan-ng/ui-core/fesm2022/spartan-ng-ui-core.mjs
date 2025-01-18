import { InjectionToken, forwardRef, inject } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function createInjectionToken(description) {
    const token = new InjectionToken(description);
    const provideFn = (value) => {
        return { provide: token, useValue: value };
    };
    const provideExistingFn = (value) => {
        return { provide: token, useExisting: forwardRef(value) };
    };
    const injectFn = (options = {}) => {
        return inject(token, options);
    };
    return [injectFn, provideFn, provideExistingFn, token];
}

const [injectCustomClassSettable, provideCustomClassSettable, provideCustomClassSettableExisting, SET_CLASS_TO_CUSTOM_ELEMENT_TOKEN,] = createInjectionToken('@spartan-ng SET_CLASS_TO_CUSTOM_ELEMENT_TOKEN');

/**
 * Set by Angular to true when in development mode.
 * Allows for tree-shaking code that is only used in development.
 */
const brnDevMode = ngDevMode;

const [injectExposedSideProvider, provideExposedSideProvider, provideExposedSideProviderExisting, EXPOSES_SIDE_TOKEN,] = createInjectionToken('@spartan-ng EXPOSES_SIDE_TOKEN');

const [injectExposesStateProvider, provideExposesStateProvider, provideExposesStateProviderExisting, EXPOSES_STATE_TOKEN,] = createInjectionToken('@spartan-ng EXPOSES_STATE_TOKEN');

const [injectTableClassesSettable, provideTableClassesSettable, provideTableClassesSettableExisting, SET_TABLE_CLASSES_TOKEN,] = createInjectionToken('@spartan-ng SET_TABLE_CLASSES_TOKEN');

function brnZoneFull(zone) {
    return (source) => new Observable((subscriber) => source.subscribe({
        next: (value) => zone.run(() => subscriber.next(value)),
        error: (error) => zone.run(() => subscriber.error(error)),
        complete: () => zone.run(() => subscriber.complete()),
    }));
}
function brnZoneFree(zone) {
    return (source) => new Observable((subscriber) => zone.runOutsideAngular(() => source.subscribe(subscriber)));
}
function brnZoneOptimized(zone) {
    return pipe(brnZoneFree(zone), brnZoneFull(zone));
}

function hlm(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Generated bundle index. Do not edit.
 */

export { EXPOSES_SIDE_TOKEN, EXPOSES_STATE_TOKEN, SET_CLASS_TO_CUSTOM_ELEMENT_TOKEN, SET_TABLE_CLASSES_TOKEN, brnDevMode, brnZoneFree, brnZoneFull, brnZoneOptimized, hlm, injectCustomClassSettable, injectExposedSideProvider, injectExposesStateProvider, injectTableClassesSettable, provideCustomClassSettable, provideCustomClassSettableExisting, provideExposedSideProvider, provideExposedSideProviderExisting, provideExposesStateProvider, provideExposesStateProviderExisting, provideTableClassesSettable, provideTableClassesSettableExisting };
//# sourceMappingURL=spartan-ng-ui-core.mjs.map
