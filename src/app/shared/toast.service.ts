import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private toasts: ToastMessage[] = [];

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const id = Math.random().toString(36).substring(2, 15);
    const toast: ToastMessage = { id, type, message };
    this.toasts = [...this.toasts, toast];
    this.toastsSubject.next(this.toasts);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(this.toasts);
  }
}
