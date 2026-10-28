import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<ToastMessage[]>([]);
  public toasts = this.toasts$.asObservable();
  private counter = 0;

  show(text: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') {
    const id = ++this.counter;
    const current = this.toasts$.value;
    this.toasts$.next([...current, { id, text, type }]);

    setTimeout(() => {
      this.remove(id);
    }, 4500);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  error(text: string) {
    this.show(text, 'danger');
  }

  warning(text: string) {
    this.show(text, 'warning');
  }

  info(text: string) {
    this.show(text, 'info');
  }

  remove(id: number) {
    const current = this.toasts$.value;
    this.toasts$.next(current.filter(t => t.id !== id));
  }
}
