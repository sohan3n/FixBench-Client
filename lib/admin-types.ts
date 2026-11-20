export type AdminUserRole = "customer" | "technician" | "admin";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: AdminUserRole;
  plan: "free" | "pro";
  phone: string;
  area: string;
  createdAt: string;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalTechnicians: number;
  totalCustomers: number;
  pendingServices: number;
  totalServices: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface AdminMonthlyStat {
  month: string;
  revenue: number;
  transactions: number;
}

export interface AdminServiceItem {
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
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBookingItem {
  _id: string;
  serviceId: string;
  serviceTitle: string;
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
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "in-progress"
    | "completed"
    | "cancelled";
  finalAmount: number;
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
}

export interface AdminPaymentItem {
  _id: string;
  type?: "booking" | "pro_upgrade";
  bookingId?: string;
  serviceTitle?: string;
  customerName?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  amount: number;
  currency?: string;
  paymentStatus: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt: string;
}