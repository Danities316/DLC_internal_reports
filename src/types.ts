export interface DailyReport {
  id?: string;
  date: string; // YYYY-MM-DD
  centreId: string;
  totalProduction: number;
  fresh: number;
  renewal: number;
  reissue: number;
  male: number;
  female: number;
  classes: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
    G: number;
    H: number;
    J: number;
  };
  ageGroups: {
    "18-25": number;
    "26-60": number;
    "60+": number;
  };
  remarks?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  createdBy: string; // userId
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: 'officer' | 'admin';
  centreId: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  role: string;
  centreId: string;
}

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
