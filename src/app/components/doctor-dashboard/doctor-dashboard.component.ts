import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor/doctor.service';
import { Appointment, AppointmentStatus } from '../../models/doctor.models';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-doctor-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './doctor-dashboard.component.html',
    styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
    appointments: Appointment[] = [];
    selectedAppt: Appointment | null = null;
    consultForm: FormGroup;
    showConsultModal = false;
    patientDocuments: any[] = [];
    private destroy$ = new Subject<void>();



    constructor(
        private doctorService: DoctorService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private toastService: ToastService
    ) {
        this.consultForm = this.fb.group({
            appointmentId: [null, Validators.required],
            diagnosis: ['', Validators.required],
            medicines: [''],
            notes: ['']
        });
    }

    ngOnInit(): void {
        this.loadAppointments();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openConsult(appt: Appointment) {
        this.selectedAppt = appt;
        this.consultForm.patchValue({
            appointmentId: appt.id || (appt as any).Id,
            diagnosis: '',
            medicines: '',
            notes: ''
        });
        this.showConsultModal = true;


        const patientId = appt.patientId || (appt as any).PatientId || (appt as any).patientID || (appt as any).PatientID;

        if (patientId) {
            this.doctorService.getPatientDocuments(patientId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: docs => {
                        this.patientDocuments = docs;
                        this.cdr.detectChanges();
                    },
                    error: err => {
                        this.toastService.error('Failed to load patient documents');
                    }
                });
        } else {
            this.toastService.error('Patient record ID not found in appointment');
        }
    }

    submitConsult() {
        if (this.consultForm.valid) {
            this.doctorService.completeConsultation(this.consultForm.value)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadAppointments();
                    this.showConsultModal = false;
                    this.selectedAppt = null;
                });
        }
    }

    loadAppointments() {
        this.doctorService.getAppointments()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: Appointment[]) => {
                this.appointments = data;
                this.cdr.detectChanges();
            });
    }

    getStatusLabel(status: number): string {
        return AppointmentStatus[status];
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

    logout() {
        this.authService.logout()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.router.navigate(['/login']);
            });
    }

    jwtDate(dateStr: string): number {
        return new Date(dateStr).getTime();
    }
}
