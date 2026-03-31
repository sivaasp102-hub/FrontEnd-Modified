import { Patient, DoctorProfile } from './admin.models';

export interface Appointment {
    id: number;
    startTime: string; 
    endTime: string;
    status: number;
    patientId: number;
    doctorId: number;
    patientName?: string;
    doctorName?: string;
    patient?: Patient;
    doctor?: DoctorProfile;
    consultation?: Consultation;
    complaint?: string;
    urgency?: string;
     problemDescription?: string;
    allergies?: string;
    chronicDiseases?: string;
    diagnosis?: string;
    prescribedMedicines?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

export interface Consultation {
    id: number;
    appointmentId: number;
    diagnosis: string;
    prescribedMedicines?: string;
    notes?: string;
}

export enum AppointmentStatus {
    Pending = 0,
    Confirmed = 1,
    Completed = 2,
    Cancelled = 3
}
