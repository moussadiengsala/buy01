export interface TableClassesSettable {
    setTableClasses: (classes: Partial<{
        table: string;
        headerRow: string;
        bodyRow: string;
    }>) => void;
}
export declare const injectTableClassesSettable: {
    (): TableClassesSettable;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional?: false;
    }): TableClassesSettable;
    (injectOptions: import("@angular/core").InjectOptions & {
        optional: true;
    }): TableClassesSettable | null;
}, provideTableClassesSettable: (value: TableClassesSettable) => import("@angular/core").Provider, provideTableClassesSettableExisting: (valueFactory: () => import("@angular/core").Type<TableClassesSettable>) => import("@angular/core").Provider, SET_TABLE_CLASSES_TOKEN: import("@angular/core").InjectionToken<TableClassesSettable>;
