import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../../models/doctor.models'; // Reusing appointment
import { Patient } from '../../models/admin.models'; // Reusing Patient model

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private apiUrl = 'http://localhost:5121/api/Patient';

    constructor(private http: HttpClient) { }

    getProfile(): Observable<Patient> {
        return this.http.get<Patient>(`${this.apiUrl}/profile`, { withCredentials: true });
    }

    getAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`, { withCredentials: true });
    }

    updateProfile(patient: Patient): Observable<any> {
        return this.http.put(`${this.apiUrl}/profile`, patient, { withCredentials: true });
    }

    bookAppointment(appointment: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/appointments`, appointment, { withCredentials: true });
    }
}
