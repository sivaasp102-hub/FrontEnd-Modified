import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100">
      <div *ngFor="let toast of toastService.toasts" 
           class="toast show align-items-center border-0 mb-2 shadow-sm fade-in" 
           [ngClass]="{
             'text-bg-success': toast.type === 'success',
             'text-bg-danger': toast.type === 'error',
             'text-bg-info': toast.type === 'info',
             'text-bg-warning': toast.type === 'warning'
           }"
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center">
            <i class="bi fs-5 me-2" [ngClass]="{
                'bi-check-circle-fill': toast.type === 'success',
                'bi-exclamation-triangle-fill': toast.type === 'error',
                'bi-info-circle-fill': toast.type === 'info',
                'bi-exclamation-circle-fill': toast.type === 'warning'
            }"></i>
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                  (click)="toastService.remove(toast.id)" aria-label="Close"></button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .fade-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
    toastService = inject(ToastService);
}
