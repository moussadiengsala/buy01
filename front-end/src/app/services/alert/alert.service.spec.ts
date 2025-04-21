import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { Alert, AlertVariant } from '../../types';
import { BehaviorSubject } from 'rxjs';

describe('AlertService', () => {
  let service: AlertService;
  let alertSubject: BehaviorSubject<Alert | null>;

  beforeEach(() => {
    alertSubject = new BehaviorSubject<Alert | null>(null);
    TestBed.configureTestingModule({
      providers: [AlertService]
    });
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should show success alert', () => {
      const title = 'Success Title';
      const message = 'Test success message';
      service.success(title, message);
      service.alert$.subscribe(alert => {
        expect(alert?.variant).toBe(AlertVariant.Success);
        expect(alert?.title).toBe(title);
        expect(alert?.message).toBe(message);
      });
    });

    it('should handle object message', () => {
      const title = 'Success Title';
      const message = { error: 'Test error', code: '123' };
      service.success(title, message);
      service.alert$.subscribe(alert => {
        expect(alert?.variant).toBe(AlertVariant.Success);
        expect(alert?.title).toBe(title);
        expect(alert?.message).toEqual(['error: Test error', 'code: 123']);
      });
    });
  });

  describe('error', () => {
    it('should show error alert', () => {
      const title = 'Error Title';
      const message = 'Test error message';
      service.error(title, message);
      service.alert$.subscribe(alert => {
        expect(alert?.variant).toBe(AlertVariant.Error);
        expect(alert?.title).toBe(title);
        expect(alert?.message).toBe(message);
      });
    });
  });

  describe('warning', () => {
    it('should show warning alert', () => {
      const title = 'Warning Title';
      const message = 'Test warning message';
      service.warning(title, message);
      service.alert$.subscribe(alert => {
        expect(alert?.variant).toBe(AlertVariant.Warning);
        expect(alert?.title).toBe(title);
        expect(alert?.message).toBe(message);
      });
    });
  });

  describe('info', () => {
    it('should show info alert', () => {
      const title = 'Info Title';
      const message = 'Test info message';
      service.info(title, message);
      service.alert$.subscribe(alert => {
        expect(alert?.variant).toBe(AlertVariant.Info);
        expect(alert?.title).toBe(title);
        expect(alert?.message).toBe(message);
      });
    });
  });

  describe('clear', () => {
    it('should clear the alert', () => {
      service.success('Test Title', 'Test message');
      service.clear();
      service.alert$.subscribe(alert => {
        expect(alert).toBeNull();
      });
    });
  });
});
