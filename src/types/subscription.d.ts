import { Package } from "./package";

export interface Payment {
  id: string;
  userId: string;
  packageId: string;
  price: number;
  discount: number;
  finalPrice: number;
  phoneNumber: string;
  transactionId: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  paymentId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  questionLimit?: number;
  usageCount?: Record<string, any>;
  package?: Package;
  payment?: Payment;
}

export interface CreateSubscriptionRequest {
  packageId: string;
  phoneNumber?: string;
  transactionId?: string;
  paymentMethod?: string;
  isFreePackage?: boolean;
  replaceExisting?: boolean;
}

export interface SubscriptionResponse {
  subscription: Subscription;
  payment: Payment;
  package: Package;
  features: Record<string, any>;
  limits: Record<string, any>;
  isActive: boolean;
  isFree: boolean;
  questionLimit?: number;
  questionSetsCreated?: number;
  allSubscriptions?: Subscription[];
  isRepurchase?: boolean;
  addedQuestions?: number;
  newQuestionLimit?: number;
}

export interface PaymentVerificationRequest {
  paymentStatus?: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
}

export interface PaymentListResponse {
  result: Payment[];
  message: string;
}

export interface SubscriptionListResponse {
  result: Subscription[];
  message: string;
}
