import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import * as i0 from "@angular/core";
export class NgIconStack {
    constructor() {
        /** The size of the child icons */
        this.size = input.required();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgIconStack, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "18.2.0", type: NgIconStack, isStandalone: true, selector: "ng-icon-stack", inputs: { size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.--ng-icon__size": "size()" } }, ngImport: i0, template: '<ng-content />', isInline: true, styles: [":host{display:inline-flex;justify-content:center;align-items:center;position:relative;width:var(--ng-icon__size);height:var(--ng-icon__size)}:host ::ng-deep ng-icon{position:absolute}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgIconStack, decorators: [{
            type: Component,
            args: [{ selector: 'ng-icon-stack', standalone: true, template: '<ng-content />', changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[style.--ng-icon__size]': 'size()',
                    }, styles: [":host{display:inline-flex;justify-content:center;align-items:center;position:relative;width:var(--ng-icon__size);height:var(--ng-icon__size)}:host ::ng-deep ng-icon{position:absolute}\n"] }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi1zdGFjay5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9saWIvY29tcG9uZW50cy9pY29uLXN0YWNrL2ljb24tc3RhY2suY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQVkxRSxNQUFNLE9BQU8sV0FBVztJQVZ4QjtRQVdFLGtDQUFrQztRQUN6QixTQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBVSxDQUFDO0tBQzFDOzhHQUhZLFdBQVc7a0dBQVgsV0FBVyxzUUFQWixnQkFBZ0I7OzJGQU9mLFdBQVc7a0JBVnZCLFNBQVM7K0JBQ0UsZUFBZSxjQUNiLElBQUksWUFDTixnQkFBZ0IsbUJBRVQsdUJBQXVCLENBQUMsTUFBTSxRQUN6Qzt3QkFDSix5QkFBeUIsRUFBRSxRQUFRO3FCQUNwQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIGlucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nLWljb24tc3RhY2snLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICB0ZW1wbGF0ZTogJzxuZy1jb250ZW50IC8+JyxcbiAgc3R5bGVVcmw6ICcuL2ljb24tc3RhY2suY29tcG9uZW50LnNjc3MnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUuLS1uZy1pY29uX19zaXplXSc6ICdzaXplKCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBOZ0ljb25TdGFjayB7XG4gIC8qKiBUaGUgc2l6ZSBvZiB0aGUgY2hpbGQgaWNvbnMgKi9cbiAgcmVhZG9ubHkgc2l6ZSA9IGlucHV0LnJlcXVpcmVkPHN0cmluZz4oKTtcbn1cbiJdfQ==