import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {AlertService} from "../../services/alert/alert.service";
import {Alert, AlertVariant} from "../../types";
import {provideIcons} from "@ng-icons/core";
import {lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX} from "@ng-icons/lucide";

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [NgClass, NgIf, NgForOf],
    providers: [provideIcons({ lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX })],
    templateUrl: './alert.component.html',
})
export class AlertComponent {
  alert: Alert | null = null;

  constructor(private alertService: AlertService) {
    this.alertService.alert$.subscribe((alert) => {
      this.alert = alert;
    });
  }

  // Method to clear the alert
  clearAlert(): void {
    this.alertService.clear();
  }

  isMessageArray(message: string | string[]): message is string[] {
    return Array.isArray(message);
  }


  get variants() {
    return AlertVariant;
  }

  get alertStyles(): Record<string, boolean> {
    if (!this.alert) return {};
    
    return {
      'bg-green-50 border-green-200': this.alert.variant === AlertVariant.Success,
      'bg-red-50 border-red-200': this.alert.variant === AlertVariant.Error,
      'bg-yellow-50 border-yellow-200': this.alert.variant === AlertVariant.Warning,
      'bg-blue-50 border-blue-200': this.alert.variant === AlertVariant.Info,
    };
  }
  
  get titleStyles(): Record<string, boolean> {
    if (!this.alert) return {};
    
    return {
      'text-green-800': this.alert.variant === AlertVariant.Success,
      'text-red-800': this.alert.variant === AlertVariant.Error,
      'text-yellow-800': this.alert.variant === AlertVariant.Warning,
      'text-blue-800': this.alert.variant === AlertVariant.Info,
    };
  }
  
  get messageStyles(): Record<string, boolean> {
    if (!this.alert) return {};
    
    return {
      'text-green-700': this.alert.variant === AlertVariant.Success,
      'text-red-700': this.alert.variant === AlertVariant.Error,
      'text-yellow-700': this.alert.variant === AlertVariant.Warning,
      'text-blue-700': this.alert.variant === AlertVariant.Info,
    };
  }

  protected readonly lucideCheck = lucideCheck;
  protected readonly lucideCircleX = lucideCircleX;
  protected readonly lucideInfo = lucideInfo;
  protected readonly lucideMessageCircleWarning = lucideMessageCircleWarning;
  protected readonly lucideX = lucideX;
}
