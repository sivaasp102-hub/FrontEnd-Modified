import { Appointment } from './doctor.models';

export interface DoctorProfile {
    id?: number;
    name: string;
    specialization: string;
    email: string;
    userId?: string;
}

export interface Patient {
    id?: number;
    name: string;
    email: string;
    age: number;
    contactNumber: string;
    problemDescription: string;
    urgency?: string;
    userId?: string;
    allergies?: string;
    chronicDiseases?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    isActive?: boolean;
}

export interface PatientDocument {
    id: number;
    patientId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    uploadDate: string;
}

export interface VisitTimelineDto {
    appointmentId: number;
    doctorName: string;
    date: string;
    status: string;
    diagnosis?: string;
    treatment?: string;
}

export interface AdminDashboardViewModel {
    appointments: Appointment[];
    totalAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    doctorCount: number;
    patientCount: number;
    appointmentDates: string[];
    appointmentCounts: number[];
    statusCounts: number[];
}
