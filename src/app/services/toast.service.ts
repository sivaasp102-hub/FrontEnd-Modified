import { Injectable } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    delay?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts: Toast[] = [];

    private idCounter = 0;

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', delay: number = 5000) {
        const id = this.idCounter++;
        const toast: Toast = { id, message, type, delay };

        this.toasts.push(toast);

        if (delay > 0) {
            setTimeout(() => {
                this.remove(id);
            }, delay);
        }
    }

    success(message: string) {
        this.show(message, 'success');
    }

    error(message: string) {
        this.show(message, 'error');
    }

    info(message: string) {
        this.show(message, 'info');
    }

    warning(message: string) {
        this.show(message, 'warning');
    }

    remove(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}
