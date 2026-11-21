export type UserRole = "customer" | "technician" | "admin";
export type TechnicianPlan = "free" | "pro";

export const SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const;
export type ServiceMode = (typeof SERVICE_MODES)[number];

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export interface StatusHistoryEntry {
  status: BookingStatus | "paid";
  changedAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  phone?: string;
  area?: string;
  bio?: string;
  plan?: TechnicianPlan;
  createdAt?: string;
}

export interface ServiceItem {
  _id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface BookingItem {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: ServiceCategory;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  statusHistory: StatusHistoryEntry[];
  rating?: number;
  review?: string;
  reviewComment?: string;
  createdAt: string;
}

export interface PaymentItem {
  _id: string;
  bookingId: string;
  paymentType?: "booking" | "subscription";
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: "usd";
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}