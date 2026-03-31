import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../../models/doctor.models';
import { DoctorProfile, Patient } from '../../models/admin.models';

@Injectable({
    providedIn: 'root'
})
export class ReceptionistService {
    private apiUrl = 'http://localhost:5121/api/Receptionist';

    constructor(private http: HttpClient) { }

    getAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/dashboard`, { withCredentials: true });
    }

    addPatient(patient: Patient): Observable<any> {
        return this.http.post(`${this.apiUrl}/patients`, patient, { withCredentials: true });
    }

    updatePatient(id: number, patient: Patient): Observable<any> {
        return this.http.put(`${this.apiUrl}/patients/${id}`, patient, { withCredentials: true });
    }

    addAppointment(appointment: Appointment): Observable<any> {
        return this.http.post(`${this.apiUrl}/appointments`, appointment, { withCredentials: true });
    }

    updateStatus(id: number, status: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/appointments/${id}/status`, { status }, { withCredentials: true });
    }

    getDoctors(): Observable<DoctorProfile[]> {
        return this.http.get<DoctorProfile[]>(`${this.apiUrl}/doctors`, { withCredentials: true });
    }

    getPatients(): Observable<Patient[]> {
        return this.http.get<Patient[]>(`${this.apiUrl}/patients`, { withCredentials: true });
    }

    searchPatients(query: string): Observable<Patient[]> {
        return this.http.get<Patient[]>(`${this.apiUrl}/patients/search?query=${query}`, { withCredentials: true });
    }

    getPatientTimeline(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/patients/${id}/timeline`, { withCredentials: true });
    }

    uploadDocument(id: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/patients/${id}/documents`, formData, { withCredentials: true });
    }

    getDocuments(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/patients/${id}/documents`, { withCredentials: true });
    }

    deletePatient(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/patients/${id}`, { withCredentials: true });
    }
}
