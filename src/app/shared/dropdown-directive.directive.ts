import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[appDropdownDirective]',
  exportAs: 'appDropdownDirective' // Export the directive with this name
})
export class DropdownDirectiveDirective {
  @HostBinding('class.open') @HostBinding('attr.aria-expanded') isOpen = false;

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event']) clickOutside(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  constructor(private elRef: ElementRef) {}

  // Method to toggle the dropdown
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  // Method to open the dropdown
  open(): void {
    this.isOpen = true;
  }

  // Method to close the dropdown
  close(): void {
    this.isOpen = false;
  }
}
