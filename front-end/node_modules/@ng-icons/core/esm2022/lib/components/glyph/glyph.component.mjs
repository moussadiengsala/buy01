import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute, } from '@angular/core';
import { injectNgGlyphsConfig } from '../../providers/glyph-config.provider';
import { injectNgGlyphs } from '../../providers/glyph.provider';
import { coerceCssPixelValue } from '../../utils/coercion';
import * as i0 from "@angular/core";
export class NgGlyph {
    constructor() {
        /**
         * Access the available glyphsets
         */
        this.glyphsets = injectNgGlyphs();
        /**
         * Access the default configuration
         */
        this.config = injectNgGlyphsConfig();
        /**
         * Define the name of the glyph to display
         */
        this.name = input.required();
        /**
         * Define the glyphset to use
         */
        this.glyphset = input(this.glyphsets.defaultGlyphset);
        /**
         * Define the optical size of the glyph
         */
        this.opticalSize = input(this.config.opticalSize, {
            transform: numberAttribute,
        });
        /**
         * Define the weight of the glyph
         */
        this.weight = input(this.config.weight, { transform: numberAttribute });
        /**
         * Define the grade of the glyph
         */
        this.grade = input(this.config.grade, { transform: numberAttribute });
        /**
         * Define the fill of the glyph
         */
        this.fill = input(this.config.fill, { transform: booleanAttribute });
        /**
         * Define the size of the glyph
         */
        this.size = input(this.config.size, { transform: coerceCssPixelValue });
        /**
         * Define the color of the glyph
         */
        this.color = input(this.config.color);
        /**
         * Derive the glyphset class from the glyphset name
         */
        this.glyphsetClass = computed(() => {
            const glyphset = this.glyphsets.glyphsets.find(glyphset => glyphset.name === this.glyphset());
            if (!glyphset) {
                throw new Error(`The glyphset "${this.glyphset()}" does not exist. Please provide a valid glyphset.`);
            }
            return glyphset.baseClass;
        });
        /**
         * Define the font variation settings of the glyph
         */
        this.fontVariationSettings = computed(() => {
            return `'FILL' ${this.fill() ? 1 : 0}, 'wght' ${this.weight()}, 'GRAD' ${this.grade()}, 'opsz' ${this.opticalSize()}`;
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgGlyph, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "18.2.0", type: NgGlyph, isStandalone: true, selector: "ng-glyph", inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, glyphset: { classPropertyName: "glyphset", publicName: "glyphset", isSignal: true, isRequired: false, transformFunction: null }, opticalSize: { classPropertyName: "opticalSize", publicName: "opticalSize", isSignal: true, isRequired: false, transformFunction: null }, weight: { classPropertyName: "weight", publicName: "weight", isSignal: true, isRequired: false, transformFunction: null }, grade: { classPropertyName: "grade", publicName: "grade", isSignal: true, isRequired: false, transformFunction: null }, fill: { classPropertyName: "fill", publicName: "fill", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "glyphsetClass()", "textContent": "name()", "style.--ng-glyph__size": "size()", "style.color": "color()", "style.font-variation-settings": "fontVariationSettings()" } }, ngImport: i0, template: ``, isInline: true, styles: [":host{display:inline-block;width:var(--ng-glyph__size);height:var(--ng-glyph__size);font-size:var(--ng-glyph__size);overflow:hidden}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgGlyph, decorators: [{
            type: Component,
            args: [{ selector: 'ng-glyph', standalone: true, template: ``, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class]': 'glyphsetClass()',
                        '[textContent]': 'name()',
                        '[style.--ng-glyph__size]': 'size()',
                        '[style.color]': 'color()',
                        '[style.font-variation-settings]': 'fontVariationSettings()',
                    }, styles: [":host{display:inline-block;width:var(--ng-glyph__size);height:var(--ng-glyph__size);font-size:var(--ng-glyph__size);overflow:hidden}\n"] }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2x5cGguY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbGliL2NvbXBvbmVudHMvZ2x5cGgvZ2x5cGguY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULGdCQUFnQixFQUNoQixRQUFRLEVBQ1IsS0FBSyxFQUNMLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDOztBQWdCM0QsTUFBTSxPQUFPLE9BQU87SUFkcEI7UUFlRTs7V0FFRztRQUNjLGNBQVMsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUU5Qzs7V0FFRztRQUNjLFdBQU0sR0FBRyxvQkFBb0IsRUFBRSxDQUFDO1FBRWpEOztXQUVHO1FBQ00sU0FBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQVUsQ0FBQztRQUV6Qzs7V0FFRztRQUNNLGFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUxRDs7V0FFRztRQUNNLGdCQUFXLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BELFNBQVMsRUFBRSxlQUFlO1NBQzNCLENBQUMsQ0FBQztRQUVIOztXQUVHO1FBQ00sV0FBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBRTVFOztXQUVHO1FBQ00sVUFBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBRTFFOztXQUVHO1FBQ00sU0FBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFFekU7O1dBRUc7UUFDTSxTQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUU1RTs7V0FFRztRQUNNLFVBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQzs7V0FFRztRQUNnQixrQkFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUM1QyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUM5QyxDQUFDO1lBRUYsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNkLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUJBQWlCLElBQUksQ0FBQyxRQUFRLEVBQUUsb0RBQW9ELENBQ3JGLENBQUM7WUFDSixDQUFDO1lBRUQsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBRUg7O1dBRUc7UUFDZ0IsMEJBQXFCLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN2RCxPQUFPLFVBQ0wsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3BCLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLElBQUksQ0FBQyxLQUFLLEVBQUUsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztRQUNwRixDQUFDLENBQUMsQ0FBQztLQUNKOzhHQTlFWSxPQUFPO2tHQUFQLE9BQU8sNnVDQVhSLEVBQUU7OzJGQVdELE9BQU87a0JBZG5CLFNBQVM7K0JBQ0UsVUFBVSxjQUNSLElBQUksWUFDTixFQUFFLG1CQUVLLHVCQUF1QixDQUFDLE1BQU0sUUFDekM7d0JBQ0osU0FBUyxFQUFFLGlCQUFpQjt3QkFDNUIsZUFBZSxFQUFFLFFBQVE7d0JBQ3pCLDBCQUEwQixFQUFFLFFBQVE7d0JBQ3BDLGVBQWUsRUFBRSxTQUFTO3dCQUMxQixpQ0FBaUMsRUFBRSx5QkFBeUI7cUJBQzdEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgY29tcHV0ZWQsXG4gIGlucHV0LFxuICBudW1iZXJBdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaW5qZWN0TmdHbHlwaHNDb25maWcgfSBmcm9tICcuLi8uLi9wcm92aWRlcnMvZ2x5cGgtY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IGluamVjdE5nR2x5cGhzIH0gZnJvbSAnLi4vLi4vcHJvdmlkZXJzL2dseXBoLnByb3ZpZGVyJztcbmltcG9ydCB7IGNvZXJjZUNzc1BpeGVsVmFsdWUgfSBmcm9tICcuLi8uLi91dGlscy9jb2VyY2lvbic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nLWdseXBoJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgdGVtcGxhdGU6IGBgLFxuICBzdHlsZVVybDogJy4vZ2x5cGguY29tcG9uZW50LnNjc3MnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDoge1xuICAgICdbY2xhc3NdJzogJ2dseXBoc2V0Q2xhc3MoKScsXG4gICAgJ1t0ZXh0Q29udGVudF0nOiAnbmFtZSgpJyxcbiAgICAnW3N0eWxlLi0tbmctZ2x5cGhfX3NpemVdJzogJ3NpemUoKScsXG4gICAgJ1tzdHlsZS5jb2xvcl0nOiAnY29sb3IoKScsXG4gICAgJ1tzdHlsZS5mb250LXZhcmlhdGlvbi1zZXR0aW5nc10nOiAnZm9udFZhcmlhdGlvblNldHRpbmdzKCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBOZ0dseXBoIHtcbiAgLyoqXG4gICAqIEFjY2VzcyB0aGUgYXZhaWxhYmxlIGdseXBoc2V0c1xuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBnbHlwaHNldHMgPSBpbmplY3ROZ0dseXBocygpO1xuXG4gIC8qKlxuICAgKiBBY2Nlc3MgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvblxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBjb25maWcgPSBpbmplY3ROZ0dseXBoc0NvbmZpZygpO1xuXG4gIC8qKlxuICAgKiBEZWZpbmUgdGhlIG5hbWUgb2YgdGhlIGdseXBoIHRvIGRpc3BsYXlcbiAgICovXG4gIHJlYWRvbmx5IG5hbWUgPSBpbnB1dC5yZXF1aXJlZDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIERlZmluZSB0aGUgZ2x5cGhzZXQgdG8gdXNlXG4gICAqL1xuICByZWFkb25seSBnbHlwaHNldCA9IGlucHV0KHRoaXMuZ2x5cGhzZXRzLmRlZmF1bHRHbHlwaHNldCk7XG5cbiAgLyoqXG4gICAqIERlZmluZSB0aGUgb3B0aWNhbCBzaXplIG9mIHRoZSBnbHlwaFxuICAgKi9cbiAgcmVhZG9ubHkgb3B0aWNhbFNpemUgPSBpbnB1dCh0aGlzLmNvbmZpZy5vcHRpY2FsU2l6ZSwge1xuICAgIHRyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlLFxuICB9KTtcblxuICAvKipcbiAgICogRGVmaW5lIHRoZSB3ZWlnaHQgb2YgdGhlIGdseXBoXG4gICAqL1xuICByZWFkb25seSB3ZWlnaHQgPSBpbnB1dCh0aGlzLmNvbmZpZy53ZWlnaHQsIHsgdHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGUgfSk7XG5cbiAgLyoqXG4gICAqIERlZmluZSB0aGUgZ3JhZGUgb2YgdGhlIGdseXBoXG4gICAqL1xuICByZWFkb25seSBncmFkZSA9IGlucHV0KHRoaXMuY29uZmlnLmdyYWRlLCB7IHRyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlIH0pO1xuXG4gIC8qKlxuICAgKiBEZWZpbmUgdGhlIGZpbGwgb2YgdGhlIGdseXBoXG4gICAqL1xuICByZWFkb25seSBmaWxsID0gaW5wdXQodGhpcy5jb25maWcuZmlsbCwgeyB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUgfSk7XG5cbiAgLyoqXG4gICAqIERlZmluZSB0aGUgc2l6ZSBvZiB0aGUgZ2x5cGhcbiAgICovXG4gIHJlYWRvbmx5IHNpemUgPSBpbnB1dCh0aGlzLmNvbmZpZy5zaXplLCB7IHRyYW5zZm9ybTogY29lcmNlQ3NzUGl4ZWxWYWx1ZSB9KTtcblxuICAvKipcbiAgICogRGVmaW5lIHRoZSBjb2xvciBvZiB0aGUgZ2x5cGhcbiAgICovXG4gIHJlYWRvbmx5IGNvbG9yID0gaW5wdXQodGhpcy5jb25maWcuY29sb3IpO1xuXG4gIC8qKlxuICAgKiBEZXJpdmUgdGhlIGdseXBoc2V0IGNsYXNzIGZyb20gdGhlIGdseXBoc2V0IG5hbWVcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBnbHlwaHNldENsYXNzID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgIGNvbnN0IGdseXBoc2V0ID0gdGhpcy5nbHlwaHNldHMuZ2x5cGhzZXRzLmZpbmQoXG4gICAgICBnbHlwaHNldCA9PiBnbHlwaHNldC5uYW1lID09PSB0aGlzLmdseXBoc2V0KCksXG4gICAgKTtcblxuICAgIGlmICghZ2x5cGhzZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBnbHlwaHNldCBcIiR7dGhpcy5nbHlwaHNldCgpfVwiIGRvZXMgbm90IGV4aXN0LiBQbGVhc2UgcHJvdmlkZSBhIHZhbGlkIGdseXBoc2V0LmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBnbHlwaHNldC5iYXNlQ2xhc3M7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBEZWZpbmUgdGhlIGZvbnQgdmFyaWF0aW9uIHNldHRpbmdzIG9mIHRoZSBnbHlwaFxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvbnRWYXJpYXRpb25TZXR0aW5ncyA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICByZXR1cm4gYCdGSUxMJyAke1xuICAgICAgdGhpcy5maWxsKCkgPyAxIDogMFxuICAgIH0sICd3Z2h0JyAke3RoaXMud2VpZ2h0KCl9LCAnR1JBRCcgJHt0aGlzLmdyYWRlKCl9LCAnb3BzeicgJHt0aGlzLm9wdGljYWxTaXplKCl9YDtcbiAgfSk7XG59XG4iXX0=