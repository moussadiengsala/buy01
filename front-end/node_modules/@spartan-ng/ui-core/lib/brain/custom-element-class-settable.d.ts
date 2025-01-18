export interface CustomElementClassSettable {
    setClassToCustomElement: (newClass: string) => void;
}
export declare const injectCustomClassSettable: {
    (): CustomElementClassSettable;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional?: false;
    }): CustomElementClassSettable;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional: true;
    }): CustomElementClassSettable | null;
}, provideCustomClassSettable: (value: CustomElementClassSettable) => import("@angular/core").Provider, provideCustomClassSettableExisting: (valueFactory: () => import("@angular/core").Type<CustomElementClassSettable>) => import("@angular/core").Provider, SET_CLASS_TO_CUSTOM_ELEMENT_TOKEN: import("@angular/core").InjectionToken<CustomElementClassSettable>;
