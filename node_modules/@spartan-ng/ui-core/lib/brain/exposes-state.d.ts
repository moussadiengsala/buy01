import type { Signal } from '@angular/core';
export interface ExposesState {
    state: Signal<'open' | 'closed'>;
}
export declare const injectExposesStateProvider: {
    (): ExposesState;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional?: false;
    }): ExposesState;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional: true;
    }): ExposesState | null;
}, provideExposesStateProvider: (value: ExposesState) => import("@angular/core").Provider, provideExposesStateProviderExisting: (valueFactory: () => import("@angular/core").Type<ExposesState>) => import("@angular/core").Provider, EXPOSES_STATE_TOKEN: import("@angular/core").InjectionToken<ExposesState>;
