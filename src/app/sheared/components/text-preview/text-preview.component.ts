import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-preview',
  standalone: true,
  imports: [],
  templateUrl: './text-preview.component.html',
  styleUrl: './text-preview.component.css'
})
export class TextPreviewComponent {
  @Input() text: string = '';
  @Input() limit: number = 100; 

  showFullText: boolean = false;

  toggleTextDisplay() {
    this.showFullText = !this.showFullText;
  }

  get displayText(): string {
    // If showFullText is true, return the full text, otherwise return the truncated version
    return this.showFullText ? this.text : this.text.slice(0, this.limit) + '...';
  }
}
