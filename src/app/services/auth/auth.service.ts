import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginModel, RegisterModel, User } from '../../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5121/api/Account';
    
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();
    
    private isInitializedSubject = new BehaviorSubject<boolean>(false);
    isInitialized$ = this.isInitializedSubject.asObservable();

    constructor(private http: HttpClient) {
        this.checkAuth().subscribe(() => this.isInitializedSubject.next(true));
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    checkAuth(): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrl}/me`, {
            withCredentials: true
        }).pipe(
            tap(user => this.currentUserSubject.next(user)),
            catchError(() => {
                this.currentUserSubject.next(null);
                return of(null);
            })
        );
    }

    login(credentials: LoginModel): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/login`, credentials, {
            withCredentials: true
        }).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    register(data: RegisterModel): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/register`, data, {
            withCredentials: true
        });
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
            withCredentials: true
        }).pipe(
            tap(() => this.currentUserSubject.next(null))
        );
    }
}
