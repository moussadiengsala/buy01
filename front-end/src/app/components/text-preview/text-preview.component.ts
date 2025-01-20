import {Component, Input, numberAttribute} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

@Component({
    selector: 'app-text-preview',
    imports: [NgClass, NgIf],
    standalone: true,
    template: `
        <div>
            <p [ngClass]="textClass">{{ displayText }}</p>
            <button *ngIf="shouldShowToggleButton">
                    (click)="toggleTextDisplay()"
                    [ngClass]="buttonClass">
                {{ showFullText ? 'Less' : 'More' }}
            </button>
        </div>
    `
})
export class TextPreviewComponent {
  @Input({required: true}) text!: string;                // Input text to display
  @Input({transform: numberAttribute}) limit: number = 100;              // Limit for truncated text
  @Input() isExpended: boolean = false;
  @Input() textClass: string = '';           // Class for text styling
  @Input() buttonClass: string = '';         // Class for button styling

  showFullText: boolean = false;             // Toggle for text display

  toggleTextDisplay(): void {
    if (!this.isExpended) return
    this.showFullText = !this.showFullText;
  }

    /**
     * Computes the text to display based on the current state.
     * Handles edge cases like empty text or a limit greater than the text length.
     */
    get displayText(): string {
        if (!this.text) return ''; // Defensive check for undefined or empty text
        if (this.text.length <= this.limit) return this.text

        if (!this.isExpended) return `${this.text.slice(0, this.limit)}...`;
        return this.showFullText ? this.text : `${this.text.slice(0, this.limit)}...`;
    }

    /**
     * Determines whether the toggle button should be displayed.
     */
    get shouldShowToggleButton(): boolean {
        return this.isExpended && this.text.length > this.limit;
    }
}
