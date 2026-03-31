import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    registerForm: FormGroup;
    errorMessage = '';

    constructor() {
        this.registerForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['Patient', Validators.required],
            name: ['', Validators.required],
            age: [null],
            contactNumber: [''],
            problemDescription: [''],
            allergies: [''],
            chronicDiseases: [''],
            emergencyContactName: [''],
            emergencyContactPhone: [''],
            specialization: ['']
        });

        this.registerForm.get('role')?.valueChanges.subscribe(role => {
            this.updateValidators(role);
        });
    }

    updateValidators(role: string) {
        const age = this.registerForm.get('age');
        const spec = this.registerForm.get('specialization');

        if (role === 'Patient') {
            age?.setValidators([Validators.required, Validators.min(0)]);
            spec?.clearValidators();
        } else if (role === 'Doctor') {
            spec?.setValidators([Validators.required]);
            age?.clearValidators();
        } else {
            age?.clearValidators();
            spec?.clearValidators();
        }
        age?.updateValueAndValidity();
        spec?.updateValueAndValidity();
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.errorMessage = '';

            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.toastService.success('Registration successful! Please sign in.');
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
                }
            });
        }
    }
}
