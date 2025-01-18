import { isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, Injector, input, PLATFORM_ID, Renderer2, runInInjectionContext, } from '@angular/core';
import { injectNgIconPostProcessor, injectNgIconPreProcessor, } from '../../providers/features/csp';
import { injectLogger } from '../../providers/features/logger';
import { injectNgIconConfig } from '../../providers/icon-config.provider';
import { injectNgIconLoader, injectNgIconLoaderCache, } from '../../providers/icon-loader.provider';
import { injectNgIcons } from '../../providers/icon.provider';
import { coerceLoaderResult } from '../../utils/async';
import { coerceCssPixelValue } from '../../utils/coercion';
import { toPropertyName } from '../../utils/format';
import * as i0 from "@angular/core";
export class NgIcon {
    constructor() {
        /** Access the global icon config */
        this.config = injectNgIconConfig();
        /** Access the icons */
        this.icons = injectNgIcons();
        /** Access the icon loader if defined */
        this.loader = injectNgIconLoader();
        /** Access the icon cache if defined */
        this.cache = injectNgIconLoaderCache();
        /** Access the pre-processor */
        this.preProcessor = injectNgIconPreProcessor();
        /** Access the post-processor */
        this.postProcessor = injectNgIconPostProcessor();
        /** Access the injector */
        this.injector = inject(Injector);
        /** Access the renderer */
        this.renderer = inject(Renderer2);
        /** Determine the platform we are rendering on */
        this.platform = inject(PLATFORM_ID);
        /** Access the element ref */
        this.elementRef = inject(ElementRef);
        /** Access the logger */
        this.logger = injectLogger();
        /** Define the name of the icon to display */
        this.name = input();
        /** Define the svg of the icon to display */
        this.svg = input();
        /** Define the size of the icon */
        this.size = input(this.config.size, { transform: coerceCssPixelValue });
        /** Define the stroke-width of the icon */
        this.strokeWidth = input(this.config.strokeWidth);
        /** Define the color of the icon */
        this.color = input(this.config.color);
        // update the icon anytime the name or svg changes
        effect(() => this.updateIcon());
    }
    ngOnDestroy() {
        this.svgElement = undefined;
    }
    async updateIcon() {
        const name = this.name();
        const svg = this.svg();
        // if the svg is defined, insert it into the template
        if (svg !== undefined) {
            this.setSvg(svg);
            return;
        }
        if (name === undefined) {
            return;
        }
        const propertyName = toPropertyName(name);
        for (const icons of [...this.icons].reverse()) {
            if (icons[propertyName]) {
                // insert the SVG into the template
                this.setSvg(icons[propertyName]);
                return;
            }
        }
        // if there is a loader defined, use it to load the icon
        if (this.loader) {
            const result = await this.requestIconFromLoader(name);
            // if the result is a string, insert the SVG into the template
            if (result !== null) {
                this.setSvg(result);
                return;
            }
        }
        // if there is no icon with this name warn the user as they probably forgot to import it
        this.logger.warn(`No icon named ${name} was found. You may need to import it using the withIcons function.`);
    }
    setSvg(svg) {
        // if we are on the server, simply innerHTML the svg as we don't have the
        // level of control over the DOM that we do on the client, in otherwords
        // the approach we take to insert the svg on the client will not work on the server
        if (isPlatformServer(this.platform)) {
            this.elementRef.nativeElement.innerHTML = svg;
            // mark this component as server side rendered
            this.elementRef.nativeElement.setAttribute('data-ng-icon-ssr', '');
            return;
        }
        // if this was previously server side rendered, we should check if the svg is the same
        // if it is, we don't need to do anything
        if (this.elementRef.nativeElement.hasAttribute('data-ng-icon-ssr')) {
            // if it is different, we need to remove the server side rendered flag
            this.elementRef.nativeElement.removeAttribute('data-ng-icon-ssr');
            // retrieve the svg element
            this.svgElement =
                this.elementRef.nativeElement.querySelector('svg') ??
                    undefined;
            if (this.elementRef.nativeElement.innerHTML === svg) {
                return;
            }
        }
        // remove the old element
        if (this.svgElement) {
            this.renderer.removeChild(this.elementRef.nativeElement, this.svgElement);
        }
        // if the svg is empty, don't insert anything
        if (svg === '') {
            return;
        }
        const template = this.renderer.createElement('template');
        this.renderer.setProperty(template, 'innerHTML', this.preProcessor(svg));
        this.svgElement = template.content.firstElementChild;
        this.postProcessor(this.svgElement);
        // insert the element into the dom
        this.renderer.appendChild(this.elementRef.nativeElement, this.svgElement);
    }
    /**
     * Request the icon from the loader.
     * @param name The name of the icon to load.
     * @returns The SVG content for a given icon name.
     */
    requestIconFromLoader(name) {
        return new Promise(resolve => {
            runInInjectionContext(this.injector, async () => {
                // if we have a cache, check if the icon is already loaded (i.e, it is a string)
                if (this.cache) {
                    const cachedResult = this.cache.get(name);
                    if (typeof cachedResult === 'string') {
                        resolve(cachedResult);
                        return;
                    }
                    // it may be a promise, so we need to await it
                    if (cachedResult instanceof Promise) {
                        const result = await cachedResult;
                        resolve(result);
                        return;
                    }
                }
                const promise = coerceLoaderResult(this.loader(name));
                // store the promise in the cache so if we get repeated calls (e.g. in a loop) before the loader has resolved
                // then don't call the loader function multiple times
                this.cache?.set(name, promise);
                // await the result of the promise
                const result = await promise;
                // if we have a cache, store the result
                this.cache?.set(name, result);
                resolve(result);
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgIcon, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "18.2.0", type: NgIcon, isStandalone: true, selector: "ng-icon", inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: false, transformFunction: null }, svg: { classPropertyName: "svg", publicName: "svg", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, strokeWidth: { classPropertyName: "strokeWidth", publicName: "strokeWidth", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "style.--ng-icon__stroke-width": "strokeWidth()", "style.--ng-icon__size": "size()", "style.--ng-icon__color": "color()" } }, ngImport: i0, template: '', isInline: true, styles: [":host{display:inline-block;width:var(--ng-icon__size, 1em);height:var(--ng-icon__size, 1em);line-height:initial;vertical-align:initial;overflow:hidden}:host ::ng-deep svg{width:inherit;height:inherit;vertical-align:inherit}@layer ng-icon{:host{color:var(--ng-icon__color, currentColor)}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgIcon, decorators: [{
            type: Component,
            args: [{ selector: 'ng-icon', template: '', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[style.--ng-icon__stroke-width]': 'strokeWidth()',
                        '[style.--ng-icon__size]': 'size()',
                        '[style.--ng-icon__color]': 'color()',
                    }, styles: [":host{display:inline-block;width:var(--ng-icon__size, 1em);height:var(--ng-icon__size, 1em);line-height:initial;vertical-align:initial;overflow:hidden}:host ::ng-deep svg{width:inherit;height:inherit;vertical-align:inherit}@layer ng-icon{:host{color:var(--ng-icon__color, currentColor)}}\n"] }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9saWIvY29tcG9uZW50cy9pY29uL2ljb24uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULE1BQU0sRUFDTixVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsRUFDUixLQUFLLEVBRUwsV0FBVyxFQUNYLFNBQVMsRUFDVCxxQkFBcUIsR0FDdEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUNMLHlCQUF5QixFQUN6Qix3QkFBd0IsR0FDekIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDMUUsT0FBTyxFQUNMLGtCQUFrQixFQUNsQix1QkFBdUIsR0FDeEIsTUFBTSxzQ0FBc0MsQ0FBQztBQUM5QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdkQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDOztBQWtCcEQsTUFBTSxPQUFPLE1BQU07SUFzRGpCO1FBckRBLG9DQUFvQztRQUNuQixXQUFNLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztRQUUvQyx1QkFBdUI7UUFDTixVQUFLLEdBQUcsYUFBYSxFQUFFLENBQUM7UUFFekMsd0NBQXdDO1FBQ3ZCLFdBQU0sR0FBRyxrQkFBa0IsRUFBRSxDQUFDO1FB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RDtnQkFDckQsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUvQixrQ0FBa0M7Z0JBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDO2dCQUU3Qix1Q0FBdUM7Z0JBQ3ZDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFOUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzhHQWhNVSxNQUFNO2tHQUFOLE1BQU0saTBCQVZQLEVBQUU7OzJGQVVELE1BQU07a0JBWmxCLFNBQVM7K0JBQ0UsU0FBUyxZQUNULEVBQUUsY0FDQSxJQUFJLG1CQUVDLHVCQUF1QixDQUFDLE1BQU0sUUFDekM7d0JBQ0osaUNBQWlDLEVBQUUsZUFBZTt3QkFDbEQseUJBQXlCLEVBQUUsUUFBUTt3QkFDbkMsMEJBQTBCLEVBQUUsU0FBUztxQkFDdEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIGVmZmVjdCxcbiAgRWxlbWVudFJlZixcbiAgaW5qZWN0LFxuICBJbmplY3RvcixcbiAgaW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgUExBVEZPUk1fSUQsXG4gIFJlbmRlcmVyMixcbiAgcnVuSW5JbmplY3Rpb25Db250ZXh0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB0eXBlIHsgSWNvbk5hbWUgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2ljb24vaWNvbi1uYW1lJztcbmltcG9ydCB7XG4gIGluamVjdE5nSWNvblBvc3RQcm9jZXNzb3IsXG4gIGluamVjdE5nSWNvblByZVByb2Nlc3Nvcixcbn0gZnJvbSAnLi4vLi4vcHJvdmlkZXJzL2ZlYXR1cmVzL2NzcCc7XG5pbXBvcnQgeyBpbmplY3RMb2dnZXIgfSBmcm9tICcuLi8uLi9wcm92aWRlcnMvZmVhdHVyZXMvbG9nZ2VyJztcbmltcG9ydCB7IGluamVjdE5nSWNvbkNvbmZpZyB9IGZyb20gJy4uLy4uL3Byb3ZpZGVycy9pY29uLWNvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQge1xuICBpbmplY3ROZ0ljb25Mb2FkZXIsXG4gIGluamVjdE5nSWNvbkxvYWRlckNhY2hlLFxufSBmcm9tICcuLi8uLi9wcm92aWRlcnMvaWNvbi1sb2FkZXIucHJvdmlkZXInO1xuaW1wb3J0IHsgaW5qZWN0TmdJY29ucyB9IGZyb20gJy4uLy4uL3Byb3ZpZGVycy9pY29uLnByb3ZpZGVyJztcbmltcG9ydCB7IGNvZXJjZUxvYWRlclJlc3VsdCB9IGZyb20gJy4uLy4uL3V0aWxzL2FzeW5jJztcbmltcG9ydCB7IGNvZXJjZUNzc1BpeGVsVmFsdWUgfSBmcm9tICcuLi8uLi91dGlscy9jb2VyY2lvbic7XG5pbXBvcnQgeyB0b1Byb3BlcnR5TmFtZSB9IGZyb20gJy4uLy4uL3V0aWxzL2Zvcm1hdCc7XG5cbi8vIFRoaXMgaXMgYSB0eXBlc2NyaXB0IHR5cGUgdG8gcHJldmVudCBpbmZlcmVuY2UgZnJvbSBjb2xsYXBzaW5nIHRoZSB1bmlvbiB0eXBlIHRvIGEgc3RyaW5nIHRvIGltcHJvdmUgdHlwZSBzYWZldHlcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG5leHBvcnQgdHlwZSBJY29uVHlwZSA9IEljb25OYW1lIHwgKHN0cmluZyAmIHt9KTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmctaWNvbicsXG4gIHRlbXBsYXRlOiAnJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc3R5bGVVcmxzOiBbJy4vaWNvbi5jb21wb25lbnQuc2NzcyddLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUuLS1uZy1pY29uX19zdHJva2Utd2lkdGhdJzogJ3N0cm9rZVdpZHRoKCknLFxuICAgICdbc3R5bGUuLS1uZy1pY29uX19zaXplXSc6ICdzaXplKCknLFxuICAgICdbc3R5bGUuLS1uZy1pY29uX19jb2xvcl0nOiAnY29sb3IoKScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE5nSWNvbiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBBY2Nlc3MgdGhlIGdsb2JhbCBpY29uIGNvbmZpZyAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZyA9IGluamVjdE5nSWNvbkNvbmZpZygpO1xuXG4gIC8qKiBBY2Nlc3MgdGhlIGljb25zICovXG4gIHByaXZhdGUgcmVhZG9ubHkgaWNvbnMgPSBpbmplY3ROZ0ljb25zKCk7XG5cbiAgLyoqIEFjY2VzcyB0aGUgaWNvbiBsb2FkZXIgaWYgZGVmaW5lZCAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGxvYWRlciA9IGluamVjdE5nSWNvbkxvYWRlcigpO1xuXG4gIC8qKiBBY2Nlc3MgdGhlIGljb24gY2FjaGUgaWYgZGVmaW5lZCAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGNhY2hlID0gaW5qZWN0TmdJY29uTG9hZGVyQ2FjaGUoKTtcblxuICAvKiogQWNjZXNzIHRoZSBwcmUtcHJvY2Vzc29yICovXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlUHJvY2Vzc29yID0gaW5qZWN0TmdJY29uUHJlUHJvY2Vzc29yKCk7XG5cbiAgLyoqIEFjY2VzcyB0aGUgcG9zdC1wcm9jZXNzb3IgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBwb3N0UHJvY2Vzc29yID0gaW5qZWN0TmdJY29uUG9zdFByb2Nlc3NvcigpO1xuXG4gIC8qKiBBY2Nlc3MgdGhlIGluamVjdG9yICovXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuXG4gIC8qKiBBY2Nlc3MgdGhlIHJlbmRlcmVyICovXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVuZGVyZXIgPSBpbmplY3QoUmVuZGVyZXIyKTtcblxuICAvKiogRGV0ZXJtaW5lIHRoZSBwbGF0Zm9ybSB3ZSBhcmUgcmVuZGVyaW5nIG9uICovXG4gIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm0gPSBpbmplY3QoUExBVEZPUk1fSUQpO1xuXG4gIC8qKiBBY2Nlc3MgdGhlIGVsZW1lbnQgcmVmICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudFJlZiA9IGluamVjdDxFbGVtZW50UmVmPEhUTUxFbGVtZW50Pj4oRWxlbWVudFJlZik7XG5cbiAgLyoqIEFjY2VzcyB0aGUgbG9nZ2VyICovXG4gIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyID0gaW5qZWN0TG9nZ2VyKCk7XG5cbiAgLyoqIERlZmluZSB0aGUgbmFtZSBvZiB0aGUgaWNvbiB0byBkaXNwbGF5ICovXG4gIHJlYWRvbmx5IG5hbWUgPSBpbnB1dDxJY29uVHlwZT4oKTtcblxuICAvKiogRGVmaW5lIHRoZSBzdmcgb2YgdGhlIGljb24gdG8gZGlzcGxheSAqL1xuICByZWFkb25seSBzdmcgPSBpbnB1dDxzdHJpbmc+KCk7XG5cbiAgLyoqIERlZmluZSB0aGUgc2l6ZSBvZiB0aGUgaWNvbiAqL1xuICByZWFkb25seSBzaXplID0gaW5wdXQodGhpcy5jb25maWcuc2l6ZSwgeyB0cmFuc2Zvcm06IGNvZXJjZUNzc1BpeGVsVmFsdWUgfSk7XG5cbiAgLyoqIERlZmluZSB0aGUgc3Ryb2tlLXdpZHRoIG9mIHRoZSBpY29uICovXG4gIHJlYWRvbmx5IHN0cm9rZVdpZHRoID0gaW5wdXQ8c3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkPihcbiAgICB0aGlzLmNvbmZpZy5zdHJva2VXaWR0aCxcbiAgKTtcblxuICAvKiogRGVmaW5lIHRoZSBjb2xvciBvZiB0aGUgaWNvbiAqL1xuICByZWFkb25seSBjb2xvciA9IGlucHV0KHRoaXMuY29uZmlnLmNvbG9yKTtcblxuICAvKiogU3RvcmUgdGhlIGluc2VydGVkIFNWRyAqL1xuICBwcml2YXRlIHN2Z0VsZW1lbnQ/OiBTVkdFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIHVwZGF0ZSB0aGUgaWNvbiBhbnl0aW1lIHRoZSBuYW1lIG9yIHN2ZyBjaGFuZ2VzXG4gICAgZWZmZWN0KCgpID0+IHRoaXMudXBkYXRlSWNvbigpKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuc3ZnRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlSWNvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5uYW1lKCk7XG4gICAgY29uc3Qgc3ZnID0gdGhpcy5zdmcoKTtcblxuICAgIC8vIGlmIHRoZSBzdmcgaXMgZGVmaW5lZCwgaW5zZXJ0IGl0IGludG8gdGhlIHRlbXBsYXRlXG4gICAgaWYgKHN2ZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldFN2ZyhzdmcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSB0b1Byb3BlcnR5TmFtZShuYW1lKTtcblxuICAgIGZvciAoY29uc3QgaWNvbnMgb2YgWy4uLnRoaXMuaWNvbnNdLnJldmVyc2UoKSkge1xuICAgICAgaWYgKGljb25zW3Byb3BlcnR5TmFtZV0pIHtcbiAgICAgICAgLy8gaW5zZXJ0IHRoZSBTVkcgaW50byB0aGUgdGVtcGxhdGVcbiAgICAgICAgdGhpcy5zZXRTdmcoaWNvbnNbcHJvcGVydHlOYW1lXSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBhIGxvYWRlciBkZWZpbmVkLCB1c2UgaXQgdG8gbG9hZCB0aGUgaWNvblxuICAgIGlmICh0aGlzLmxvYWRlcikge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5yZXF1ZXN0SWNvbkZyb21Mb2FkZXIobmFtZSk7XG5cbiAgICAgIC8vIGlmIHRoZSByZXN1bHQgaXMgYSBzdHJpbmcsIGluc2VydCB0aGUgU1ZHIGludG8gdGhlIHRlbXBsYXRlXG4gICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0U3ZnKHJlc3VsdCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBpY29uIHdpdGggdGhpcyBuYW1lIHdhcm4gdGhlIHVzZXIgYXMgdGhleSBwcm9iYWJseSBmb3Jnb3QgdG8gaW1wb3J0IGl0XG4gICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgIGBObyBpY29uIG5hbWVkICR7bmFtZX0gd2FzIGZvdW5kLiBZb3UgbWF5IG5lZWQgdG8gaW1wb3J0IGl0IHVzaW5nIHRoZSB3aXRoSWNvbnMgZnVuY3Rpb24uYCxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRTdmcoc3ZnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBpZiB3ZSBhcmUgb24gdGhlIHNlcnZlciwgc2ltcGx5IGlubmVySFRNTCB0aGUgc3ZnIGFzIHdlIGRvbid0IGhhdmUgdGhlXG4gICAgLy8gbGV2ZWwgb2YgY29udHJvbCBvdmVyIHRoZSBET00gdGhhdCB3ZSBkbyBvbiB0aGUgY2xpZW50LCBpbiBvdGhlcndvcmRzXG4gICAgLy8gdGhlIGFwcHJvYWNoIHdlIHRha2UgdG8gaW5zZXJ0IHRoZSBzdmcgb24gdGhlIGNsaWVudCB3aWxsIG5vdCB3b3JrIG9uIHRoZSBzZXJ2ZXJcbiAgICBpZiAoaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtKSkge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuaW5uZXJIVE1MID0gc3ZnO1xuICAgICAgLy8gbWFyayB0aGlzIGNvbXBvbmVudCBhcyBzZXJ2ZXIgc2lkZSByZW5kZXJlZFxuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLW5nLWljb24tc3NyJywgJycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlmIHRoaXMgd2FzIHByZXZpb3VzbHkgc2VydmVyIHNpZGUgcmVuZGVyZWQsIHdlIHNob3VsZCBjaGVjayBpZiB0aGUgc3ZnIGlzIHRoZSBzYW1lXG4gICAgLy8gaWYgaXQgaXMsIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmdcbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLW5nLWljb24tc3NyJykpIHtcbiAgICAgIC8vIGlmIGl0IGlzIGRpZmZlcmVudCwgd2UgbmVlZCB0byByZW1vdmUgdGhlIHNlcnZlciBzaWRlIHJlbmRlcmVkIGZsYWdcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1uZy1pY29uLXNzcicpO1xuXG4gICAgICAvLyByZXRyaWV2ZSB0aGUgc3ZnIGVsZW1lbnRcbiAgICAgIHRoaXMuc3ZnRWxlbWVudCA9XG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3I8U1ZHRWxlbWVudD4oJ3N2ZycpID8/XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmlubmVySFRNTCA9PT0gc3ZnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZW1vdmUgdGhlIG9sZCBlbGVtZW50XG4gICAgaWYgKHRoaXMuc3ZnRWxlbWVudCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5zdmdFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgc3ZnIGlzIGVtcHR5LCBkb24ndCBpbnNlcnQgYW55dGhpbmdcbiAgICBpZiAoc3ZnID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlOiBIVE1MVGVtcGxhdGVFbGVtZW50ID1cbiAgICAgIHRoaXMucmVuZGVyZXIuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFByb3BlcnR5KHRlbXBsYXRlLCAnaW5uZXJIVE1MJywgdGhpcy5wcmVQcm9jZXNzb3Ioc3ZnKSk7XG5cbiAgICB0aGlzLnN2Z0VsZW1lbnQgPSB0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gICAgdGhpcy5wb3N0UHJvY2Vzc29yKHRoaXMuc3ZnRWxlbWVudCk7XG5cbiAgICAvLyBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGUgZG9tXG4gICAgdGhpcy5yZW5kZXJlci5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5zdmdFbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRoZSBpY29uIGZyb20gdGhlIGxvYWRlci5cbiAgICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgdGhlIGljb24gdG8gbG9hZC5cbiAgICogQHJldHVybnMgVGhlIFNWRyBjb250ZW50IGZvciBhIGdpdmVuIGljb24gbmFtZS5cbiAgICovXG4gIHByaXZhdGUgcmVxdWVzdEljb25Gcm9tTG9hZGVyKG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcnVuSW5JbmplY3Rpb25Db250ZXh0KHRoaXMuaW5qZWN0b3IsIGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIGNhY2hlLCBjaGVjayBpZiB0aGUgaWNvbiBpcyBhbHJlYWR5IGxvYWRlZCAoaS5lLCBpdCBpcyBhIHN0cmluZylcbiAgICAgICAgaWYgKHRoaXMuY2FjaGUpIHtcbiAgICAgICAgICBjb25zdCBjYWNoZWRSZXN1bHQgPSB0aGlzLmNhY2hlLmdldChuYW1lKTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgY2FjaGVkUmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmVzb2x2ZShjYWNoZWRSZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGl0IG1heSBiZSBhIHByb21pc2UsIHNvIHdlIG5lZWQgdG8gYXdhaXQgaXRcbiAgICAgICAgICBpZiAoY2FjaGVkUmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2FjaGVkUmVzdWx0O1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2VyY2VMb2FkZXJSZXN1bHQodGhpcy5sb2FkZXIhKG5hbWUpKTtcblxuICAgICAgICAvLyBzdG9yZSB0aGUgcHJvbWlzZSBpbiB0aGUgY2FjaGUgc28gaWYgd2UgZ2V0IHJlcGVhdGVkIGNhbGxzIChlLmcuIGluIGEgbG9vcCkgYmVmb3JlIHRoZSBsb2FkZXIgaGFzIHJlc29sdmVkXG4gICAgICAgIC8vIHRoZW4gZG9uJ3QgY2FsbCB0aGUgbG9hZGVyIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIHRoaXMuY2FjaGU/LnNldChuYW1lLCBwcm9taXNlKTtcblxuICAgICAgICAvLyBhd2FpdCB0aGUgcmVzdWx0IG9mIHRoZSBwcm9taXNlXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByb21pc2U7XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIGNhY2hlLCBzdG9yZSB0aGUgcmVzdWx0XG4gICAgICAgIHRoaXMuY2FjaGU/LnNldChuYW1lLCByZXN1bHQpO1xuXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=