// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { AlertComponent } from './alert.component';
// import { AlertService } from '../../services/alert/alert.service';
// import { BehaviorSubject } from 'rxjs';
// import { Alert, AlertVariant } from '../../types';
// import { provideIcons } from '@ng-icons/core';
// import { lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX } from '@ng-icons/lucide';
//
// describe('AlertComponent', () => {
//   let component: AlertComponent;
//   let fixture: ComponentFixture<AlertComponent>;
//   let alertServiceMock: jasmine.SpyObj<AlertService>;
//   let alertSubject: BehaviorSubject<Alert | null>;
//
//   const mockAlert: Alert = {
//     variant: AlertVariant.Success,
//     title: 'Success',
//     message: 'Operation completed successfully'
//   };
//
//   beforeEach(async () => {
//     alertSubject = new BehaviorSubject<Alert | null>(null);
//     alertServiceMock = jasmine.createSpyObj('AlertService', ['clear'], {
//       alert$: alertSubject.asObservable()
//     });
//
//     await TestBed.configureTestingModule({
//       imports: [AlertComponent],
//       providers: [
//         { provide: AlertService, useValue: alertServiceMock },
//         provideIcons({ lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX })
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(AlertComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('Alert Subscription', () => {
//     it('should update alert when service emits new alert', () => {
//       alertSubject.next(mockAlert);
//       fixture.detectChanges();
//       expect(component.alert).toEqual(mockAlert);
//     });
//
//     it('should clear alert when service emits null', () => {
//       alertSubject.next(mockAlert);
//       fixture.detectChanges();
//       expect(component.alert).toEqual(mockAlert);
//
//       alertSubject.next(null);
//       fixture.detectChanges();
//       expect(component.alert).toBeNull();
//     });
//   });
//
//   describe('clearAlert', () => {
//     it('should call alertService.clear', () => {
//       component.clearAlert();
//       expect(alertServiceMock.clear).toHaveBeenCalled();
//     });
//   });
//
//   describe('isMessageArray', () => {
//     it('should return true for array messages', () => {
//       const arrayMessage = ['Message 1', 'Message 2'];
//       expect(component.isMessageArray(arrayMessage)).toBeTrue();
//     });
//
//     it('should return false for string messages', () => {
//       const stringMessage = 'Single message';
//       expect(component.isMessageArray(stringMessage)).toBeFalse();
//     });
//   });
//
//   describe('Style Getters', () => {
//     it('should return correct styles for success variant', () => {
//       alertSubject.next({
//         variant: AlertVariant.Success,
//         title: 'Test',
//         message: 'Test'
//       });
//       fixture.detectChanges();
//
//       expect(component.alertStyles).toEqual({
//         'bg-green-50 border-green-200': true
//       });
//       expect(component.titleStyles).toEqual({
//         'text-green-800': true
//       });
//       expect(component.messageStyles).toEqual({
//         'text-green-700': true
//       });
//     });
//
//     it('should return correct styles for error variant', () => {
//       alertSubject.next({
//         variant: AlertVariant.Error,
//         title: 'Test',
//         message: 'Test'
//       });
//       fixture.detectChanges();
//
//       expect(component.alertStyles).toEqual({
//         'bg-red-50 border-red-200': true
//       });
//       expect(component.titleStyles).toEqual({
//         'text-red-800': true
//       });
//       expect(component.messageStyles).toEqual({
//         'text-red-700': true
//       });
//     });
//
//     it('should return correct styles for warning variant', () => {
//       alertSubject.next({
//         variant: AlertVariant.Warning,
//         title: 'Test',
//         message: 'Test'
//       });
//       fixture.detectChanges();
//
//       expect(component.alertStyles).toEqual({
//         'bg-yellow-50 border-yellow-200': true
//       });
//       expect(component.titleStyles).toEqual({
//         'text-yellow-800': true
//       });
//       expect(component.messageStyles).toEqual({
//         'text-yellow-700': true
//       });
//     });
//
//     it('should return correct styles for info variant', () => {
//       alertSubject.next({
//         variant: AlertVariant.Info,
//         title: 'Test',
//         message: 'Test'
//       });
//       fixture.detectChanges();
//
//       expect(component.alertStyles).toEqual({
//         'bg-blue-50 border-blue-200': true
//       });
//       expect(component.titleStyles).toEqual({
//         'text-blue-800': true
//       });
//       expect(component.messageStyles).toEqual({
//         'text-blue-700': true
//       });
//     });
//
//     it('should return empty styles when no alert', () => {
//       alertSubject.next(null);
//       fixture.detectChanges();
//
//       expect(component.alertStyles).toEqual({});
//       expect(component.titleStyles).toEqual({});
//       expect(component.messageStyles).toEqual({});
//     });
//   });
//
//   describe('Icon Properties', () => {
//     it('should have all required icon properties', () => {
//       expect(component.lucideCheck).toBeDefined();
//       expect(component.lucideCircleX).toBeDefined();
//       expect(component.lucideInfo).toBeDefined();
//       expect(component.lucideMessageCircleWarning).toBeDefined();
//       expect(component.lucideX).toBeDefined();
//     });
//   });
//
//   describe('variants getter', () => {
//     it('should return AlertVariant enum', () => {
//       expect(component.variants).toBe(AlertVariant);
//     });
//   });
// });