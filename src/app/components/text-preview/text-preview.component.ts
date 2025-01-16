import {Component, Input, numberAttribute} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-text-preview',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './text-preview.component.html',
  styleUrls: ['./text-preview.component.css']
})
export class TextPreviewComponent {
  @Input({required: true}) text!: string;                // Input text to display
  @Input({transform: numberAttribute}) limit: number = 100;              // Limit for truncated text
  @Input() textClass: string = '';           // Class for text styling
  @Input() buttonClass: string = '';         // Class for button styling

  showFullText: boolean = false;             // Toggle for text display

  toggleTextDisplay(): void {
    this.showFullText = !this.showFullText;
  }

  get displayText(): string {
    return this.showFullText || this.text.length <= this.limit
        ? this.text
        : `${this.text.slice(0, this.limit)}...`;
  }
}
