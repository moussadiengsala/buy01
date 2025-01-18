import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {Alert, AlertVariant} from "../../types";

@Injectable({
  providedIn: 'root', // Makes the service available throughout the app
})
export class AlertService {
  private alertSubject = new BehaviorSubject<Alert | null>(null);

  // Observable to expose the current alert
  get alert$(): Observable<Alert | null> {
    return this.alertSubject.asObservable();
  }

  // Methods to trigger specific alerts
  success(title: string, message: string | object): void {
    this.emitAlert(AlertVariant.Success, title, message);
  }

  error(title: string, message: string | object): void {
    this.emitAlert(AlertVariant.Error, title, message);
  }

  warning(title: string, message: string | object): void {
    this.emitAlert(AlertVariant.Warning, title, message);
  }

  info(title: string, message: string | object): void {
    this.emitAlert(AlertVariant.Info, title, message);
  }

  // Clear the current alert
  clear(): void {
    this.alertSubject.next(null);
  }

  // Emit a new alert
  private emitAlert(variant: AlertVariant, title: string, message: string | object): void {
    this.alertSubject.next({ variant, title, message: this.formatMessage(message) });
  }

  private formatMessage(message: string | object): string | string[] {
    if (typeof message === 'string') {
      return message;
    } else if (typeof message === 'object' && message !== null) {
      return Object.entries(message).map(([key, value]) => `${key}: ${value}`)
    }
    return 'An unknown error occurred';
  }
}
