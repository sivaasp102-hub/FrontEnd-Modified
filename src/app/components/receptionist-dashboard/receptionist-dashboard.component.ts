
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReceptionistService } from '../../services/receptionist/receptionist.service';
import { Appointment, AppointmentStatus } from '../../models/doctor.models';
import { Patient, DoctorProfile } from '../../models/admin.models';
import { Subject, takeUntil } from 'rxjs';

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-receptionist-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './receptionist-dashboard.component.html',
    styleUrl: './receptionist-dashboard.component.scss'
})
export class ReceptionistDashboardComponent implements OnInit, OnDestroy {
    appointments: Appointment[] = [];
    patients: Patient[] = [];
    doctors: DoctorProfile[] = [];
    showModal = false;
    apptForm: FormGroup;
    patientForm: FormGroup;
    showPatientModal = false;
    AppointmentStatus = AppointmentStatus;
    searchQuery = '';
    selectedPatient: Patient | null = null;
    patientTimeline: any[] = [];
    patientDocuments: any[] = [];
    showDetailsModal = false;
    activeView: 'appointments' | 'patients' = 'appointments';
    private destroy$ = new Subject<void>();



    get sortedPatients() {

        const bookedPatientIds = this.appointments
            .filter(a => a.status !== AppointmentStatus.Cancelled)
            .map(a => a.patientId);

        return this.patients
            .filter(p => !bookedPatientIds.includes(p.id!))
            .sort((a, b) => {
                const priorityA = this.getUrgencyPriority(a.urgency);
                const priorityB = this.getUrgencyPriority(b.urgency);
                return priorityA - priorityB;
            });
    }

    get emergencyCount() {
        return this.sortedPatients.filter(p => p.urgency === 'Emergency').length;
    }

    get filteredAppointments() {
        const query = this.searchQuery.toLowerCase().trim();
        if (!query) return this.appointments;

        return this.appointments.filter(appt =>
            (appt.patientName && appt.patientName.toLowerCase().includes(query)) ||
            (appt.patient?.name && appt.patient?.name.toLowerCase().includes(query)) ||
            appt.patientId.toString().includes(query) ||
            (appt.doctorName && appt.doctorName.toLowerCase().includes(query)) ||
            (appt.doctor?.name && appt.doctor?.name.toLowerCase().includes(query)) ||
            (appt.doctor?.specialization && appt.doctor?.specialization.toLowerCase().includes(query))
        );
    }

    constructor(
        private receptionistService: ReceptionistService,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private toastService: ToastService
    ) {
        this.apptForm = this.fb.group({
            patientId: [null, Validators.required],
            doctorId: [null, Validators.required],
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            complaint: [''],
            urgency: ['Stable']
        });

        this.patientForm = this.fb.group({
            name: ['', Validators.required],
            age: [null, [Validators.required, Validators.min(0)]],
            contactNumber: ['', Validators.required],
            problemDescription: [''],
            allergies: [''],
            chronicDiseases: [''],
            emergencyContactName: [''],
            emergencyContactPhone: [''],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit(): void {
        this.loadAppointments();
        this.loadPatients();
        this.loadDoctors();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    submitPatient() {
        if (this.patientForm.valid) {
            const data = this.patientForm.value;
            const editId = this.selectedPatient?.id;

            const obs = editId
                ? this.receptionistService.updatePatient(editId, data)
                : this.receptionistService.addPatient(data);

            obs.pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadPatients();
                    this.showPatientModal = false;
                    this.patientForm.reset({
                        email: '',
                        password: ''
                    });
                    this.selectedPatient = null;
                });
        }
    }

    openAddPatient() {
        this.selectedPatient = null;
        this.patientForm.reset();
        this.patientForm.get('email')?.setValidators([Validators.required, Validators.email]);
        this.patientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.patientForm.get('email')?.updateValueAndValidity();
        this.patientForm.get('password')?.updateValueAndValidity();
        this.showPatientModal = true;
    }

    loadPatients() {
        this.receptionistService.getPatients()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.patients = data;
                this.cdr.detectChanges();
            });
    }

    openEditPatient(patient: Patient) {
        this.selectedPatient = patient;
        this.patientForm.patchValue({
            name: patient.name,
            age: patient.age,
            contactNumber: patient.contactNumber,
            problemDescription: patient.problemDescription,
            allergies: patient.allergies,
            chronicDiseases: patient.chronicDiseases,
            emergencyContactName: patient.emergencyContactName,
            emergencyContactPhone: patient.emergencyContactPhone,
            email: 'dummy@email.com',
            password: 'dummy-password'
        });

        this.patientForm.get('email')?.clearValidators();
        this.patientForm.get('password')?.clearValidators();
        this.patientForm.get('email')?.updateValueAndValidity();
        this.patientForm.get('password')?.updateValueAndValidity();

        this.showPatientModal = true;
    }

    deletePatient(id: number) {
        if (confirm('Are you sure you want to delete this patient?')) {
            this.receptionistService.deletePatient(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => this.loadPatients());
        }
    }

    loadDoctors() {
        this.receptionistService.getDoctors()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.doctors = data;
                this.cdr.detectChanges();
            });
    }

    loadAppointments() {
        this.receptionistService.getAppointments()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.appointments = data;
                this.cdr.detectChanges();
            });
    }

    confirmAppointment(id: number) {
        this.receptionistService.updateStatus(id, AppointmentStatus.Confirmed)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadAppointments());
    }

    updateApptStatus(id: number, status: AppointmentStatus) {
        this.receptionistService.updateStatus(id, status)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadAppointments());
    }

    onSearch(event: any) {
        const query = event.target.value;
        this.searchQuery = query;
        if (query.length > 2) {
            this.receptionistService.searchPatients(query)
                .pipe(takeUntil(this.destroy$))
                .subscribe(data => {
                    this.patients = data;
                    this.cdr.detectChanges();
                });
        } else if (query.length === 0) {
            this.loadPatients();
        }
    }

    viewPatientDetails(patient: Patient) {
        this.selectedPatient = patient;
        this.receptionistService.getPatientTimeline(patient.id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.patientTimeline = data;
                this.cdr.detectChanges();
            });
        this.receptionistService.getDocuments(patient.id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.patientDocuments = data;
                this.cdr.detectChanges();
            });
        this.showDetailsModal = true;
    }

    viewPatientDetailsFromAppt(appt: Appointment) {
        const patient = this.patients.find(p => p.id === appt.patientId) || {
            id: appt.patientId,
            name: appt.patientName || `Patient #${appt.patientId}`,
            age: 0,
            contactNumber: 'N/A'
        } as Patient;

        this.viewPatientDetails(patient);
    }

    onFileUpload(event: any) {
        const file = event.target.files[0];
        if (file && this.selectedPatient) {
            this.receptionistService.uploadDocument(this.selectedPatient.id!, file)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.toastService.success('Document uploaded successfully');
                        this.receptionistService.getDocuments(this.selectedPatient!.id!)
                            .pipe(takeUntil(this.destroy$))
                            .subscribe(data => {
                                this.patientDocuments = data;
                                this.cdr.detectChanges();
                            });
                        event.target.value = '';
                    },
                    error: (err) => {
                        this.toastService.error('Failed to upload document');
                        event.target.value = '';
                    }
                });
        }
    }

    getStatusLabel(status: number): string {
        return AppointmentStatus[status];
    }

    submitAppt() {
        if (this.apptForm.valid) {
            this.receptionistService.addAppointment(this.apptForm.value)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadAppointments();
                    this.showModal = false;
                    this.apptForm.reset();
                });
        }
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

    getUrgencyColor(urgency?: string): string {
        switch (urgency) {
            case 'Emergency': return 'danger';
            case 'Urgent': return 'warning text-dark';
            case 'Stable': return 'success';
            case 'Normal': return 'secondary';
            default: return 'light text-dark';
        }
    }

    getUrgencyPriority(urgency?: string): number {
        const priorities: { [key: string]: number } = {
            'Emergency': 1,
            'Urgent': 2,
            'Stable': 3,
            'Normal': 4
        };
        return priorities[urgency || ''] || 99;
    }

    bookForPatient(patient: Patient) {
        this.apptForm.patchValue({ patientId: patient.id });
        this.showModal = true;
    }
}
