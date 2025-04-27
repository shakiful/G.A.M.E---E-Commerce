import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `<div class="flex justify-center items-center h-full">
  <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
</div>`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class SpinnerComponent {}
