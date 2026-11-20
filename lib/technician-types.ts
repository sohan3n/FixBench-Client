export type ServiceApprovalStatus = "pending" | "approved" | "rejected";

export interface TechnicianService {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off";
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ServiceApprovalStatus;
  isAvailable: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianServiceQuota {
  plan: "free" | "pro";
  currentCount: number;
  maxAllowed: number | null;
  canAddService: boolean;
}

export type TechnicianJobStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface TechnicianBooking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: TechnicianJobStatus;
  finalAmount: number;
  paymentStatus: "unpaid" | "paid";
  rating: number | null;
  review: string;
  createdAt: string;
  updatedAt: string;
}