import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: (user) => {
                    this.toastService.success(`Welcome back, ${user.userName}!`);
                    const role = user.roles[0]; // Simple role check for direction
                    if (role === 'Admin') this.router.navigate(['/admin']);
                    else if (role === 'Doctor') this.router.navigate(['/doctor']);
                    else if (role === 'Patient') this.router.navigate(['/patient']);
                    else if (role === 'Receptionist') this.router.navigate(['/receptionist']);
                    else this.router.navigate(['/']);
                },
                error: (err) => {
                    this.errorMessage = 'Invalid login credentials';
                }
            });
        }
    }
}
