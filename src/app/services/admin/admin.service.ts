import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboardViewModel, DoctorProfile, Patient } from '../../models/admin.models';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:5121/api/Admin';

    constructor(private http: HttpClient) { }

    getDashboard(): Observable<AdminDashboardViewModel> {
        return this.http.get<AdminDashboardViewModel>(`${this.apiUrl}/dashboard`, { withCredentials: true });
    }


    getDoctors(search?: string): Observable<DoctorProfile[]> {
        const options = search ? { params: { search }, withCredentials: true } : { withCredentials: true };
        return this.http.get<DoctorProfile[]>(`${this.apiUrl}/doctors`, options);
    }

    addDoctor(doctor: DoctorProfile): Observable<any> {
        return this.http.post(`${this.apiUrl}/doctors`, doctor, { withCredentials: true });
    }

    updateDoctor(id: number, doctor: DoctorProfile): Observable<any> {
        return this.http.put(`${this.apiUrl}/doctors/${id}`, doctor, { withCredentials: true });
    }

    deleteDoctor(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/doctors/${id}`, { withCredentials: true });
    }


    getPatients(search?: string): Observable<Patient[]> {
        const options = search ? { params: { search }, withCredentials: true } : { withCredentials: true };
        return this.http.get<Patient[]>(`${this.apiUrl}/patients`, options);
    }

    addPatient(patient: Patient): Observable<any> {
        return this.http.post(`${this.apiUrl}/patients`, patient, { withCredentials: true });
    }

    updatePatient(id: number, patient: Patient): Observable<any> {
        return this.http.put(`${this.apiUrl}/patients/${id}`, patient, { withCredentials: true });
    }

    deletePatient(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/patients/${id}`, { withCredentials: true });
    }

    getAppointments(date?: string): Observable<any[]> {
        const options = date ? { params: { date }, withCredentials: true } : { withCredentials: true };
        return this.http.get<any[]>(`${this.apiUrl}/appointments`, options);
    }
}
