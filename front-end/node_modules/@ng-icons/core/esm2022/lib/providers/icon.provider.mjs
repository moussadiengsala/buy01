import { InjectionToken, inject } from '@angular/core';
/**
 * Define the icons to use
 * @param icons The icons to provide
 */
export function provideIcons(icons) {
    return [
        {
            provide: NgIconsToken,
            useFactory: (parentIcons = inject(NgIconsToken, {
                optional: true,
                skipSelf: true,
            })) => ({
                ...parentIcons?.reduce((acc, icons) => ({ ...acc, ...icons }), {}),
                ...icons,
            }),
            multi: true,
        },
    ];
}
export const NgIconsToken = new InjectionToken('Icons Token');
/**
 * Inject the icons to use
 * @returns The icons to use
 * @internal
 */
export function injectNgIcons() {
    return inject(NgIconsToken, { optional: true }) ?? [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2xpYi9wcm92aWRlcnMvaWNvbi5wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFZLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRTs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLEtBQTZCO0lBQ3hELE9BQU87UUFDTDtZQUNFLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLFVBQVUsRUFBRSxDQUNWLGNBQWMsTUFBTSxDQUEyQixZQUFZLEVBQUU7Z0JBQzNELFFBQVEsRUFBRSxJQUFJO2dCQUNkLFFBQVEsRUFBRSxJQUFJO2FBQ2YsQ0FBQyxFQUNGLEVBQUUsQ0FBQyxDQUFDO2dCQUNKLEdBQUcsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNsRSxHQUFHLEtBQUs7YUFDVCxDQUFDO1lBQ0YsS0FBSyxFQUFFLElBQUk7U0FDWjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUM1QyxhQUFhLENBQ2QsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsYUFBYTtJQUMzQixPQUFPLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGlvblRva2VuLCBQcm92aWRlciwgaW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogRGVmaW5lIHRoZSBpY29ucyB0byB1c2VcbiAqIEBwYXJhbSBpY29ucyBUaGUgaWNvbnMgdG8gcHJvdmlkZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUljb25zKGljb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTmdJY29uc1Rva2VuLFxuICAgICAgdXNlRmFjdG9yeTogKFxuICAgICAgICBwYXJlbnRJY29ucyA9IGluamVjdDxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+W10+KE5nSWNvbnNUb2tlbiwge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHNraXBTZWxmOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgICkgPT4gKHtcbiAgICAgICAgLi4ucGFyZW50SWNvbnM/LnJlZHVjZSgoYWNjLCBpY29ucykgPT4gKHsgLi4uYWNjLCAuLi5pY29ucyB9KSwge30pLFxuICAgICAgICAuLi5pY29ucyxcbiAgICAgIH0pLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXTtcbn1cblxuZXhwb3J0IGNvbnN0IE5nSWNvbnNUb2tlbiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+W10+KFxuICAnSWNvbnMgVG9rZW4nLFxuKTtcblxuLyoqXG4gKiBJbmplY3QgdGhlIGljb25zIHRvIHVzZVxuICogQHJldHVybnMgVGhlIGljb25zIHRvIHVzZVxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3ROZ0ljb25zKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSB7XG4gIHJldHVybiBpbmplY3QoTmdJY29uc1Rva2VuLCB7IG9wdGlvbmFsOiB0cnVlIH0pID8/IFtdO1xufVxuIl19