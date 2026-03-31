export interface LoginModel {
    email: string;
    password: string;
}

export interface RegisterModel {
    email: string;
    password: string;
    confirmPassword: string;
    allergies?: string;
    chronicDiseases?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

export interface User {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}
