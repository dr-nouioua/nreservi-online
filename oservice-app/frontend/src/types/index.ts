export type Language = 'fr' | 'ar';

export type UserRole = 'worker' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  language: Language;
  avatarUrl?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  title: string;
  bio?: string;
  skills: string[];
  rateAmount: number;
  rateUnit: RateUnit;
  wilaya: string;
  commune: string;
  available: boolean;
  rating?: number;
  completedJobs?: number;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyDescription?: string;
  wilaya: string;
  commune: string;
  verified: boolean;
}

export type RateUnit = 'hour' | 'day' | 'month' | 'total';

export interface JobPost {
  id: string;
  recruiterId: string;
  recruiterName: string;
  companyName: string;
  title: string;
  description: string;
  wilaya: string;
  commune: string;
  duration: string;
  budgetAmount: number;
  budgetUnit: RateUnit;
  paymentType: 'cash' | 'digital';
  status: 'active' | 'filled' | 'expired';
  applicantsCount: number;
  createdAt: string;
  tags?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerRate: number;
  workerRateUnit: RateUnit;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface SystemConfig {
  paymentMode: 'cash' | 'digital';
  digitalGatewayEnabled: boolean;
  platformName: string;
  supportPhone: string;
}

export interface LocationState {
  wilaya: string;
  commune: string;
}
