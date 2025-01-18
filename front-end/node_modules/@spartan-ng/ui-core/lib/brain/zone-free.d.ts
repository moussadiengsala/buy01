/**
 * We are building on shoulders of giants here and use the implementation provided by the incredible TaigaUI
 * team: https://github.com/taiga-family/taiga-ui/blob/main/projects/cdk/observables/zone-free.ts#L22
 * Check them out! Give them a try! Leave a star! Their work is incredible!
 */
import type { NgZone } from '@angular/core';
import { type MonoTypeOperatorFunction } from 'rxjs';
export declare function brnZoneFull<T>(zone: NgZone): MonoTypeOperatorFunction<T>;
export declare function brnZoneFree<T>(zone: NgZone): MonoTypeOperatorFunction<T>;
export declare function brnZoneOptimized<T>(zone: NgZone): MonoTypeOperatorFunction<T>;
