import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient/patient.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorService } from '../../services/doctor/doctor.service';
import { Appointment, AppointmentStatus } from '../../models/doctor.models';
import { Patient } from '../../models/admin.models';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './patient-dashboard.component.html',
    styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
    profile: Patient | null = null;
    appointments: Appointment[] = [];
    doctors: any[] = [];
    showProfileModal = false;
    showBookModal = false;
    profileForm: FormGroup;
    bookForm: FormGroup;
    AppointmentStatus = AppointmentStatus;
    private destroy$ = new Subject<void>();



    constructor(
        private patientService: PatientService,
        private doctorService: DoctorService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            age: [0, [Validators.required, Validators.min(0)]],
            contactNumber: ['', Validators.required],
            problemDescription: [''],
            allergies: [''],
            chronicDiseases: [''],
            emergencyContactName: [''],
            emergencyContactPhone: ['']
        });

        this.bookForm = this.fb.group({
            doctorId: [null, Validators.required],
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            complaint: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadProfile();
        this.loadAppointments();
        this.loadDoctors();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadDoctors(): void {
        this.doctorService.getDoctors()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.doctors = data;
                this.cdr.detectChanges();
            });
    }

    openEditProfile(): void {
        const p = this.profile;
        if (p) {
            this.profileForm.patchValue({
                name: p.name,
                age: p.age,
                contactNumber: p.contactNumber,
                problemDescription: p.problemDescription,
                allergies: p.allergies,
                chronicDiseases: p.chronicDiseases,
                emergencyContactName: p.emergencyContactName,
                emergencyContactPhone: p.emergencyContactPhone
            });
            this.showProfileModal = true;
        }
    }

    submitProfile(): void {
        if (this.profileForm.valid) {
            this.patientService.updateProfile(this.profileForm.value)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadProfile();
                    this.showProfileModal = false;
                });
        }
    }

    submitBooking(): void {
        if (this.bookForm.valid) {
            this.patientService.bookAppointment(this.bookForm.value)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadAppointments();
                    this.showBookModal = false;
                    this.bookForm.reset();
                });
        }
    }

    loadProfile(): void {
        this.patientService.getProfile()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.profile = data;
                this.cdr.detectChanges();
            });
    }

    loadAppointments(): void {
        this.patientService.getAppointments()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.appointments = data;
                this.cdr.detectChanges();
            });
    }

    logout() {
        this.authService.logout()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.router.navigate(['/login']);
            });
    }

    getStatusColor(status: number): string {
        switch (status) {
            case 0: return 'info';
            case 1: return 'warning text-dark';
            case 2: return 'success';
            case 3: return 'danger';
            default: return 'secondary';
        }
    }

    getStatusLabel(status: number): string {
        return AppointmentStatus[status];
    }
}
