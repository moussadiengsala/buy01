import { type InjectOptions, InjectionToken, type Provider, type Type } from '@angular/core';
type InjectFn<TTokenValue> = {
    (): TTokenValue;
    (injectOptions: InjectOptions & {
        optional?: false;
    }): TTokenValue;
    (injectOptions: InjectOptions & {
        optional: true;
    }): TTokenValue | null;
};
type ProvideFn<TTokenValue> = (value: TTokenValue) => Provider;
type ProvideExistingFn<TTokenValue> = (valueFactory: () => Type<TTokenValue>) => Provider;
export type CreateInjectionTokenReturn<TTokenValue> = [
    InjectFn<TTokenValue>,
    ProvideFn<TTokenValue>,
    ProvideExistingFn<TTokenValue>,
    InjectionToken<TTokenValue>
];
export declare function createInjectionToken<TTokenValue>(description: string): CreateInjectionTokenReturn<TTokenValue>;
export {};
