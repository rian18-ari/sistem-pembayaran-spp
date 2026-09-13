export type Role = 'admin' | 'parent';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Parent {
  id: string;
  userId?: string; // linked to UserProfile.uid if registered
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation?: string;
  studentIds: string[];
  createdAt?: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "Kelas VII-A", "Ula 1"
  grade: string; // e.g. "7", "8", "9", "10", "11", "12"
  academicYear: string; // e.g. "2024/2025"
  studentCount?: number;
  createdAt?: string;
}

export interface SppSetting {
  id: string;
  classId: string;
  className: string;
  academicYear: string; // e.g. "2024/2025"
  monthlyFee: number; // e.g. 350000
  description?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  nis: string; // Nomor Induk Siswa/Santri
  nisn: string;
  name: string;
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  parentPhone?: string;
  gender: 'L' | 'P';
  status: 'active' | 'graduated' | 'inactive';
  joinedYear: string;
  createdAt?: string;
}

export type InvoiceStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-202409-0012"
  studentId: string;
  studentName: string;
  studentNis: string;
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  month: number; // 1 - 12 (1 = Januari, etc.)
  year: number; // 2024
  academicYear: string; // "2024/2025"
  amount: number;
  status: InvoiceStatus;
  dueDate: string; // ISO or YYYY-MM-DD
  paidAt?: string;
  paymentMethod?: string;
  activePaymentId?: string;
  createdAt: string;
  notes?: string;
}

export type MidtransTransactionStatus = 
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'failure';

export interface PaymentAttempt {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  parentId: string;
  amount: number;
  paymentType?: string; // e.g. 'qris', 'bank_transfer', 'gopay'
  snapToken?: string;
  snapRedirectUrl?: string;
  orderId: string;
  transactionId?: string;
  transactionStatus: MidtransTransactionStatus;
  fraudStatus?: string;
  settlementTime?: string;
  vaNumbers?: Array<{ bank: string; va_number: string }>;
  billKey?: string;
  billerCode?: string;
  qrString?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolProfile {
  name: string;
  institutionType: 'sekolah' | 'pesantren';
  address: string;
  phone: string;
  email: string;
  website?: string;
  treasurerName: string;
  dueDay: number; // default 10 (tanggal 10 setiap bulan)
  bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }>;
}
