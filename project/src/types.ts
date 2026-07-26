export type Frequency = 'daily' | 'weekly';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string; // "HH:MM:SS"
  frequency: Frequency;
  day_of_week: number | null; // 0=Sun ... 6=Sat, null for daily
  notes: string | null;
  created_at: string;
}

export interface IntakeLog {
  id: string;
  medicine_id: string;
  taken_date: string; // "YYYY-MM-DD"
  created_at: string;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string | null;
  phone: string;
  created_at: string;
}

export interface MedicineWithStatus extends Medicine {
  takenToday: boolean;
}
