import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, ToastMessage } from './toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-4 right-4 z-50" aria-live="polite" aria-atomic="true">
      <div *ngFor="let toast of toasts" class="rounded-md shadow-lg overflow-hidden mb-2"
           [ngClass]="{
            'bg-green-500': toast.type === 'success',
            'bg-red-500': toast.type === 'error',
            'bg-blue-500': toast.type === 'info'
           }">
        <div class="flex items-center justify-between px-4 py-2 text-white">
          <div class="text-sm font-bold">{{ toast.message }}</div>
          <button (click)="removeToast(toast.id)" class="focus:outline-none">
            <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private toastSubscription: Subscription | undefined;

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.toastSubscription?.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }
}
