export type BookingJobStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export type BookingPaymentStatus = "unpaid" | "paid";

export interface BookingStatusHistoryEntry {
  status: BookingJobStatus;
  changedAt: string;
}

export interface CustomerBooking {
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
  status: BookingJobStatus;
  finalAmount: number;
  paymentStatus: BookingPaymentStatus;
  statusHistory: BookingStatusHistoryEntry[];
  rating: number | null;
  review?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}