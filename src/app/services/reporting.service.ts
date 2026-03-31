import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportingService {
    private apiUrl = 'http://localhost:5121/api/Reports';

    constructor(private http: HttpClient) { }

    getStats(period: string = 'daily'): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats?period=${period}`, { withCredentials: true });
    }

    getTopDoctors(period: string = 'all'): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/top-doctors?period=${period}`, { withCredentials: true });
    }

    getPeakHours(period: string = 'daily'): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/peak-hours?period=${period}`, { withCredentials: true });
    }

    getCancellationStats(period: string = 'daily'): Observable<any> {
        return this.http.get(`${this.apiUrl}/cancellations?period=${period}`, { withCredentials: true });
    }

    exportCsv(period: string = 'daily'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/csv?period=${period}`, { responseType: 'blob', withCredentials: true });
    }
}
