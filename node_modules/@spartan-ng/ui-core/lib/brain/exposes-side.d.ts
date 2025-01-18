import type { Signal } from '@angular/core';
export interface ExposesSide {
    side: Signal<'top' | 'bottom' | 'left' | 'right'>;
}
export declare const injectExposedSideProvider: {
    (): ExposesSide;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional?: false;
    }): ExposesSide;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional: true;
    }): ExposesSide | null;
}, provideExposedSideProvider: (value: ExposesSide) => import("@angular/core").Provider, provideExposedSideProviderExisting: (valueFactory: () => import("@angular/core").Type<ExposesSide>) => import("@angular/core").Provider, EXPOSES_SIDE_TOKEN: import("@angular/core").InjectionToken<ExposesSide>;
