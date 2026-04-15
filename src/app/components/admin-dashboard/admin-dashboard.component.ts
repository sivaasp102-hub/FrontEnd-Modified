import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin/admin.service';
import { AuthService } from '../../services/auth/auth.service';
import { AdminDashboardViewModel, DoctorProfile, Patient } from '../../models/admin.models';
import { AppointmentStatus } from '../../models/doctor.models';
import { ReportsDashboardComponent } from '../reports-dashboard/reports-dashboard.component';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ReportsDashboardComponent, AgGridAngular],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    activeTab: 'dashboard' | 'doctors' | 'patients' | 'appointments' | 'reports' = 'dashboard';
    dashboardData: AdminDashboardViewModel | null = null;
    isLoading = false;

    doctors: DoctorProfile[] = [];
    patients: Patient[] = [];
    appointments: any[] = [];
    AppointmentStatus = AppointmentStatus;

    doctorForm: FormGroup;
    patientForm: FormGroup;

    showDoctorModal = false;
    showPatientModal = false;
    editingDoctor: DoctorProfile | null = null;
    editingPatient: Patient | null = null;
    private destroy$ = new Subject<void>();


    doctorCols: ColDef[] = [
        { field: 'name', headerName: 'Doctor Name', flex: 1, cellClass: 'column-highlight-primary', filter: 'agTextColumnFilter' },
        { field: 'specialization', headerName: 'Specialization', flex: 1, filter: 'agTextColumnFilter' },
        { field: 'email', headerName: 'Email', flex: 1, filter: 'agTextColumnFilter' },
        {
            headerName: 'Actions',
            cellRenderer: (p: any) => {
                const id = p.data.id || p.data.Id;
                return `
                <div class="d-flex align-items-center h-100">
                    <button class="btn btn-xs btn-primary text-white me-2 px-2 py-1" onclick="event.stopPropagation(); window.adminEditDoc(${id})">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-xs btn-danger text-white px-2 py-1" onclick="event.stopPropagation(); window.adminDelDoc(${id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            `;
            },
            width: 180,
            sortable: false,
            filter: false
        }
    ];

    patientCols: ColDef[] = [
        { field: 'name', headerName: 'Patient Name', flex: 1, cellClass: 'column-highlight-primary', filter: 'agTextColumnFilter' },
        { field: 'email', headerName: 'Email', flex: 1, filter: 'agTextColumnFilter' },
        { field: 'age', headerName: 'Age', width: 80, filter: 'agNumberColumnFilter' },
        { field: 'contactNumber', headerName: 'Contact', flex: 1, filter: 'agTextColumnFilter' },
        { field: 'problemDescription', headerName: 'Condition', flex: 1.5, filter: 'agTextColumnFilter' },
        {
            headerName: 'Actions',
            cellRenderer: (p: any) => {
                const id = p.data.id || p.data.Id;
                return `
                <div class="d-flex align-items-center h-100">
                    <button class="btn btn-xs btn-primary text-white me-2 px-2 py-1" onclick="event.stopPropagation(); window.adminEditPat(${id})">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-xs btn-danger text-white px-2 py-1" onclick="event.stopPropagation(); window.adminDelPat(${id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            `;
            },
            width: 180,
            sortable: false,
            filter: false
        }
    ];

    apptCols: ColDef[] = [
        { field: 'startTime', headerName: 'Time', cellRenderer: (p: any) => new Date(p.value).toLocaleTimeString(), width: 120, cellClass: 'column-highlight-id', filter: 'agDateColumnFilter' },
        { field: 'patientName', headerName: 'Patient', flex: 1, cellClass: 'column-highlight-primary', filter: 'agTextColumnFilter' },
        { field: 'doctorName', headerName: 'Doctor', flex: 1, filter: 'agTextColumnFilter' },
        {
            field: 'status',
            headerName: 'Status',
            cellRenderer: (p: any) => `<span class="badge rounded-pill bg-${this.getStatusColor(p.value)}">${AppointmentStatus[p.value]}</span>`,
            width: 120
        }
    ];

    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        headerClass: 'premium-header'
    };
    headerHeight = 52;
    rowHeight = 48;

    constructor(
        private adminService: AdminService,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        this.doctorForm = this.fb.group({
            name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
            specialization: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });

        this.patientForm = this.fb.group({
            name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
            email: ['', [Validators.required, Validators.email]],
            age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
            contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            problemDescription: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadDashboard();
        this.setupAgGridHooks();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearAgGridHooks();
    }

    private setupAgGridHooks() {
        (window as any).adminEditDoc = (id: number) => {
            this.ngZone.run(() => {
                const doc = this.doctors.find(d => d.id === id);
                if (doc) this.openEditDoctor(doc);
            });
        };
        (window as any).adminDelDoc = (id: number) => {
            this.ngZone.run(() => this.deleteDoctor(id));
        };
        (window as any).adminEditPat = (id: number) => {
            this.ngZone.run(() => {
                const p = this.patients.find(p => p.id === id);
                if (p) this.openEditPatient(p);
            });
        };
        (window as any).adminDelPat = (id: number) => {
            this.ngZone.run(() => this.deletePatient(id));
        };
    }

    private clearAgGridHooks() {
        delete (window as any).adminEditDoc;
        delete (window as any).adminDelDoc;
        delete (window as any).adminEditPat;
        delete (window as any).adminDelPat;
    }

    loadDashboard() {
        this.isLoading = true;
        this.adminService.getDashboard()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: data => {
                    this.dashboardData = data;
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
    }

    loadDoctors() {
        this.adminService.getDoctors()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: data => {
                    this.doctors = data;
                    this.cdr.detectChanges();
                },
                error: () => this.cdr.detectChanges()
            });
    }

    loadPatients() {
        this.adminService.getPatients()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: data => {
                    this.patients = data;
                    this.cdr.detectChanges();
                },
                error: () => this.cdr.detectChanges()
            });
    }

    setActiveTab(tab: 'dashboard' | 'doctors' | 'patients' | 'appointments' | 'reports') {
        this.activeTab = tab;
        if (tab === 'dashboard') this.loadDashboard();
        if (tab === 'doctors') this.loadDoctors();
        if (tab === 'patients') this.loadPatients();
        if (tab === 'appointments') this.loadAppointments();
        this.cdr.detectChanges();
    }

    openAddDoctor() {
        this.editingDoctor = null;
        this.doctorForm.reset();
        this.showDoctorModal = true;
        this.cdr.detectChanges();
    }

    openEditDoctor(doc: DoctorProfile) {
        this.editingDoctor = doc;
        this.doctorForm.patchValue({
            name: doc.name,
            specialization: doc.specialization,
            email: doc.email
        });
        this.showDoctorModal = true;
        this.cdr.detectChanges();
    }

    openAddPatient() {
        this.editingPatient = null;
        this.patientForm.reset({ urgency: 'Stable' });
        this.showPatientModal = true;
        this.cdr.detectChanges();
    }

    openEditPatient(p: Patient) {
        this.editingPatient = p;
        this.patientForm.patchValue({
            name: p.name,
            email: p.email,
            age: p.age,
            contactNumber: p.contactNumber,
            problemDescription: p.problemDescription
        });
        this.showPatientModal = true;
        this.cdr.detectChanges();
    }

    deleteDoctor(id: number) {
        if (confirm('Are you sure you want to delete this doctor?')) {
            this.adminService.deleteDoctor(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadDoctors();
                    this.loadDashboard();
                });
        }
    }

    deletePatient(id: number) {
        if (confirm('Are you sure you want to delete this patient?')) {
            this.adminService.deletePatient(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadPatients();
                    this.loadDashboard();
                });
        }
    }

    loadAppointments() {
        this.adminService.getAppointments()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: data => {
                    this.appointments = data;
                    this.cdr.detectChanges();
                },
                error: () => this.cdr.detectChanges()
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

    submitDoctor() {
        if (this.doctorForm.valid) {
            const docData = this.doctorForm.value;
            const editId = this.editingDoctor?.id;

            const obs = editId
                ? this.adminService.updateDoctor(editId, docData)
                : this.adminService.addDoctor(docData);

            obs.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.loadDoctors();
                this.showDoctorModal = false;
                this.editingDoctor = null;
                this.doctorForm.reset();
                this.loadDashboard();
            });
        }
    }

    submitPatient() {
        if (this.patientForm.valid) {
            const patientData = this.patientForm.value;
            const editId = this.editingPatient?.id;

            const obs = editId
                ? this.adminService.updatePatient(editId, patientData)
                : this.adminService.addPatient(patientData);

            obs.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.loadPatients();
                this.showPatientModal = false;
                this.editingPatient = null;
                this.patientForm.reset();
                this.loadDashboard();
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
}
