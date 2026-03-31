import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { PatientDashboardComponent } from './components/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './components/doctor-dashboard/doctor-dashboard.component';
import { ReceptionistDashboardComponent } from './components/receptionist-dashboard/receptionist-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard], data: { role: 'Admin' } },
    { path: 'doctor', component: DoctorDashboardComponent, canActivate: [authGuard], data: { role: 'Doctor' } },
    { path: 'patient', component: PatientDashboardComponent, canActivate: [authGuard], data: { role: 'Patient' } },
    { path: 'receptionist', component: ReceptionistDashboardComponent, canActivate: [authGuard], data: { role: 'Receptionist' } },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
