import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../../models/doctor.models';

@Injectable({
    providedIn: 'root'
})
export class DoctorService {
    private apiUrl = 'http://localhost:5121/api/Doctor';

    constructor(private http: HttpClient) { }

    getAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}`, { withCredentials: true });
    }

    getDoctors(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/all`, { withCredentials: true });
    }

    completeConsultation(consultation: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/consult`, consultation, { withCredentials: true });
    }

    getPatientDocuments(patientId: number): Observable<any[]> {
        return this.http.get<any[]>(`http://localhost:5121/api/Receptionist/patients/${patientId}/documents`, { withCredentials: true });
    }
}
