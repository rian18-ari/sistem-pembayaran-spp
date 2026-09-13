import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

export const INITIAL_SCHOOL_PROFILE = {
  name: 'Pesantren Modern Darul Ilmi & Islamic School',
  institutionType: 'pesantren' as const,
  address: 'Jl. Raya Pesantren No. 45, Cisarua, Bogor, Jawa Barat',
  phone: '(0251) 8254991 / 0812-3456-7890',
  email: 'keuangan@darulilmi.sch.id',
  website: 'https://darulilmi.sch.id',
  treasurerName: 'Ust. Burhanuddin, S.E.',
  dueDay: 10, // Jatuh tempo tanggal 10 setiap bulan
  bankAccounts: [
    { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '7123456789', accountHolder: 'Yayasan Darul Ilmi SPP' },
    { bankName: 'Bank Mandiri', accountNumber: '133-00-9876543-2', accountHolder: 'Pesantren Modern Darul Ilmi' },
    { bankName: 'BCA Syariah', accountNumber: '088-234-5678', accountHolder: 'Bendahara SPP Darul Ilmi' },
  ],
};

export const SEED_CLASSES = [
  { id: 'cls-7a', name: 'Kelas VII-A (Tahfidz Putra)', grade: '7', academicYear: '2024/2025', studentCount: 28 },
  { id: 'cls-7b', name: 'Kelas VII-B (Reguler Putri)', grade: '7', academicYear: '2024/2025', studentCount: 30 },
  { id: 'cls-8a', name: 'Kelas VIII-A (Tahfidz Putri)', grade: '8', academicYear: '2024/2025', studentCount: 26 },
  { id: 'cls-9a', name: 'Kelas IX-A (Ula Unggulan)', grade: '9', academicYear: '2024/2025', studentCount: 25 },
  { id: 'cls-10ipa', name: 'Kelas X-MIPA (Aliyah Terpadu)', grade: '10', academicYear: '2024/2025', studentCount: 24 },
];

export const SEED_SPP_SETTINGS = [
  { id: 'spp-cls-7a', classId: 'cls-7a', className: 'Kelas VII-A (Tahfidz Putra)', academicYear: '2024/2025', monthlyFee: 450000, description: 'SPP + Pembinaan Tahfidz & Asrama' },
  { id: 'spp-cls-7b', classId: 'cls-7b', className: 'Kelas VII-B (Reguler Putri)', academicYear: '2024/2025', monthlyFee: 375000, description: 'SPP Reguler & Asrama Putri' },
  { id: 'spp-cls-8a', classId: 'cls-8a', className: 'Kelas VIII-A (Tahfidz Putri)', academicYear: '2024/2025', monthlyFee: 450000, description: 'SPP + Pembinaan Tahfidz Lanjutan' },
  { id: 'spp-cls-9a', classId: 'cls-9a', className: 'Kelas IX-A (Ula Unggulan)', academicYear: '2024/2025', monthlyFee: 475000, description: 'SPP + Bimbingan Ujian Akhir' },
  { id: 'spp-cls-10ipa', classId: 'cls-10ipa', className: 'Kelas X-MIPA (Aliyah Terpadu)', academicYear: '2024/2025', monthlyFee: 550000, description: 'SPP Jenjang Aliyah / SMA IT' },
];

export const SEED_PARENTS = [
  {
    id: 'parent-fauzi',
    userId: 'user-parent-fauzi',
    name: 'Bpk. H. Ahmad Fauzi',
    email: 'wali.fauzi@pesantren.id',
    phone: '081234567891',
    address: 'Komp. Pesona Indah Blok C3 No. 12, Bogor Selatan',
    occupation: 'Wiraswasta / Konsultan',
    studentIds: ['std-farhan', 'std-aisyah'],
  },
  {
    id: 'parent-siti',
    userId: 'user-parent-siti',
    name: 'Ibu Siti Rohmah, S.Pd.',
    email: 'wali.siti@pesantren.id',
    phone: '081398765432',
    address: 'Jl. Sukasari No. 18, Bogor',
    occupation: 'Guru ASN',
    studentIds: ['std-zaidan'],
  },
  {
    id: 'parent-ridwan',
    userId: 'user-parent-ridwan',
    name: 'Bpk. Ridwan Santoso',
    email: 'wali.ridwan@pesantren.id',
    phone: '082155678899',
    address: 'Vila Ciomas Indah No. 5B, Ciomas',
    occupation: 'Karyawan Swasta',
    studentIds: ['std-maryam'],
  },
  {
    id: 'parent-hendra',
    userId: 'user-parent-hendra',
    name: 'Bpk. Hendra Wijaya',
    email: 'wali.hendra@pesantren.id',
    phone: '081288991122',
    address: 'Jl. Raya Tajur No. 88, Bogor Timur',
    occupation: 'Pengusaha',
    studentIds: ['std-rayhan'],
  },
];

export const SEED_STUDENTS = [
  {
    id: 'std-farhan',
    nis: '202407001',
    nisn: '0098765431',
    name: 'Muhammad Farhan Fauzi',
    classId: 'cls-7a',
    className: 'Kelas VII-A (Tahfidz Putra)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    parentPhone: '081234567891',
    gender: 'L' as const,
    status: 'active' as const,
    joinedYear: '2024',
  },
  {
    id: 'std-aisyah',
    nis: '202207018',
    nisn: '0076543210',
    name: 'Aisyah Fauziah',
    classId: 'cls-9a',
    className: 'Kelas IX-A (Ula Unggulan)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    parentPhone: '081234567891',
    gender: 'P' as const,
    status: 'active' as const,
    joinedYear: '2022',
  },
  {
    id: 'std-zaidan',
    nis: '202407002',
    nisn: '0098765432',
    name: 'Zaidan Ali Al-Ghifari',
    classId: 'cls-7a',
    className: 'Kelas VII-A (Tahfidz Putra)',
    parentId: 'parent-siti',
    parentName: 'Ibu Siti Rohmah, S.Pd.',
    parentPhone: '081398765432',
    gender: 'L' as const,
    status: 'active' as const,
    joinedYear: '2024',
  },
  {
    id: 'std-maryam',
    nis: '202307015',
    nisn: '0087654321',
    name: 'Maryam Azzahra',
    classId: 'cls-8a',
    className: 'Kelas VIII-A (Tahfidz Putri)',
    parentId: 'parent-ridwan',
    parentName: 'Bpk. Ridwan Santoso',
    parentPhone: '082155678899',
    gender: 'P' as const,
    status: 'active' as const,
    joinedYear: '2023',
  },
  {
    id: 'std-rayhan',
    nis: '202107005',
    nisn: '0065432109',
    name: 'Rayhan Pratama Wijaya',
    classId: 'cls-10ipa',
    className: 'Kelas X-MIPA (Aliyah Terpadu)',
    parentId: 'parent-hendra',
    parentName: 'Bpk. Hendra Wijaya',
    parentPhone: '081288991122',
    gender: 'L' as const,
    status: 'active' as const,
    joinedYear: '2021',
  },
];

export const SEED_INVOICES = [
  // 1. Farhan (Kelas 7A - Rp 450.000)
  // Juli 2024: PAID (Lunas)
  {
    id: 'inv-202407-farhan',
    invoiceNumber: 'INV/202407/001',
    studentId: 'std-farhan',
    studentName: 'Muhammad Farhan Fauzi',
    studentNis: '202407001',
    classId: 'cls-7a',
    className: 'Kelas VII-A (Tahfidz Putra)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    month: 7,
    year: 2024,
    academicYear: '2024/2025',
    amount: 450000,
    status: 'PAID' as const,
    dueDate: '2024-07-10',
    paidAt: '2024-07-08T09:14:00Z',
    paymentMethod: 'qris',
    activePaymentId: 'pay-farhan-jul',
    createdAt: '2024-07-01T00:00:00Z',
  },
  // Agustus 2024: PAID (Lunas via Midtrans Virtual Account)
  {
    id: 'inv-202408-farhan',
    invoiceNumber: 'INV/202408/001',
    studentId: 'std-farhan',
    studentName: 'Muhammad Farhan Fauzi',
    studentNis: '202407001',
    classId: 'cls-7a',
    className: 'Kelas VII-A (Tahfidz Putra)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    month: 8,
    year: 2024,
    academicYear: '2024/2025',
    amount: 450000,
    status: 'PAID' as const,
    dueDate: '2024-08-10',
    paidAt: '2024-08-05T14:22:00Z',
    paymentMethod: 'bank_transfer_bca',
    activePaymentId: 'pay-farhan-aug-3',
    createdAt: '2024-08-01T00:00:00Z',
  },
  // September 2024: UNPAID (Tagihan Baru / Berjalan)
  {
    id: 'inv-202409-farhan',
    invoiceNumber: 'INV/202409/001',
    studentId: 'std-farhan',
    studentName: 'Muhammad Farhan Fauzi',
    studentNis: '202407001',
    classId: 'cls-7a',
    className: 'Kelas VII-A (Tahfidz Putra)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    month: 9,
    year: 2024,
    academicYear: '2024/2025',
    amount: 450000,
    status: 'UNPAID' as const,
    dueDate: '2024-09-10',
    createdAt: '2024-09-01T00:00:00Z',
  },
  // 2. Aisyah Fauziah (Kelas 9A - Rp 475.000)
  // Juli 2024: PAID
  {
    id: 'inv-202407-aisyah',
    invoiceNumber: 'INV/202407/002',
    studentId: 'std-aisyah',
    studentName: 'Aisyah Fauziah',
    studentNis: '202207018',
    classId: 'cls-9a',
    className: 'Kelas IX-A (Ula Unggulan)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    month: 7,
    year: 2024,
    academicYear: '2024/2025',
    amount: 475000,
    status: 'PAID' as const,
    dueDate: '2024-07-10',
    paidAt: '2024-07-07T11:00:00Z',
    paymentMethod: 'gopay',
    activePaymentId: 'pay-aisyah-jul',
    createdAt: '2024-07-01T00:00:00Z',
  },
  // Agustus 2024: UNPAID (Tunggakan Bulan Lalu)
  {
    id: 'inv-202408-aisyah',
    invoiceNumber: 'INV/202408/002',
    studentId: 'std-aisyah',
    studentName: 'Aisyah Fauziah',
    studentNis: '202207018',
    classId: 'cls-9a',
    className: 'Kelas IX-A (Ula Unggulan)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    month: 8,
    year: 2024,
    academicYear: '2024/2025',
    amount: 475000,
    status: 'EXPIRED' as const,
    dueDate: '2024-08-10',
    createdAt: '2024-08-01T00:00:00Z',
  },
  // September 2024: UNPAID
  {
    id: 'inv-202409-aisyah',
    invoiceNumber: 'INV/202409/002',
    studentId: 'std-aisyah',
    studentName: 'Aisyah Fauziah',
    studentNis: '202207018',
    classId: 'cls-9a',
    className: 'Kelas IX-A (Ula Unggulan)',
    parentId: 'parent-fauzi',
    parentName: 'Bpk. H. Ahmad Fauzi',
    month: 9,
    year: 2024,
    academicYear: '2024/2025',
    amount: 475000,
    status: 'UNPAID' as const,
    dueDate: '2024-09-10',
    createdAt: '2024-09-01T00:00:00Z',
  },
  // 3. Zaidan Ali (Kelas 7A - Rp 450.000)
  // September 2024: PENDING (Menunggu Pembayaran Snap)
  {
    id: 'inv-202409-zaidan',
    invoiceNumber: 'INV/202409/003',
    studentId: 'std-zaidan',
    studentName: 'Zaidan Ali Al-Ghifari',
    studentNis: '202407002',
    classId: 'cls-7a',
    className: 'Kelas VII-A (Tahfidz Putra)',
    parentId: 'parent-siti',
    parentName: 'Ibu Siti Rohmah, S.Pd.',
    month: 9,
    year: 2024,
    academicYear: '2024/2025',
    amount: 450000,
    status: 'PENDING' as const,
    dueDate: '2024-09-10',
    activePaymentId: 'pay-zaidan-sep',
    createdAt: '2024-09-01T00:00:00Z',
  },
  // 4. Maryam Azzahra (Kelas 8A - Rp 450.000)
  // September 2024: PAID
  {
    id: 'inv-202409-maryam',
    invoiceNumber: 'INV/202409/004',
    studentId: 'std-maryam',
    studentName: 'Maryam Azzahra',
    studentNis: '202307015',
    classId: 'cls-8a',
    className: 'Kelas VIII-A (Tahfidz Putri)',
    parentId: 'parent-ridwan',
    parentName: 'Bpk. Ridwan Santoso',
    month: 9,
    year: 2024,
    academicYear: '2024/2025',
    amount: 450000,
    status: 'PAID' as const,
    dueDate: '2024-09-10',
    paidAt: '2024-09-03T16:45:00Z',
    paymentMethod: 'qris',
    activePaymentId: 'pay-maryam-sep',
    createdAt: '2024-09-01T00:00:00Z',
  },
  // 5. Rayhan Pratama (Kelas 10-IPA - Rp 550.000)
  // September 2024: UNPAID
  {
    id: 'inv-202409-rayhan',
    invoiceNumber: 'INV/202409/005',
    studentId: 'std-rayhan',
    studentName: 'Rayhan Pratama Wijaya',
    studentNis: '202107005',
    classId: 'cls-10ipa',
    className: 'Kelas X-MIPA (Aliyah Terpadu)',
    parentId: 'parent-hendra',
    parentName: 'Bpk. Hendra Wijaya',
    month: 9,
    year: 2024,
    academicYear: '2024/2025',
    amount: 550000,
    status: 'UNPAID' as const,
    dueDate: '2024-09-10',
    createdAt: '2024-09-01T00:00:00Z',
  },
];

// Payments table demonstrating multiple payment attempts for a single invoice:
// e.g. inv-202408-farhan has Payment 1 (EXPIRED), Payment 2 (CANCEL/FAILED), Payment 3 (PAID/SETTLEMENT)
export const SEED_PAYMENTS = [
  {
    id: 'pay-farhan-jul',
    invoiceId: 'inv-202407-farhan',
    invoiceNumber: 'INV/202407/001',
    studentId: 'std-farhan',
    parentId: 'parent-fauzi',
    amount: 450000,
    orderId: 'SPP-INV202407001-110022',
    transactionId: 'TRX-MIDTRANS-998811',
    paymentType: 'qris',
    transactionStatus: 'settlement' as const,
    settlementTime: '2024-07-08T09:14:00Z',
    createdAt: '2024-07-08T09:10:00Z',
  },
  // Invoice Agustus Farhan - Attempt 1: Expired
  {
    id: 'pay-farhan-aug-1',
    invoiceId: 'inv-202408-farhan',
    invoiceNumber: 'INV/202408/001',
    studentId: 'std-farhan',
    parentId: 'parent-fauzi',
    amount: 450000,
    orderId: 'SPP-INV202408001-100001',
    transactionId: 'TRX-MIDTRANS-998820',
    paymentType: 'bank_transfer_bni',
    transactionStatus: 'expire' as const,
    createdAt: '2024-08-02T10:00:00Z',
  },
  // Invoice Agustus Farhan - Attempt 2: Cancelled / Failure
  {
    id: 'pay-farhan-aug-2',
    invoiceId: 'inv-202408-farhan',
    invoiceNumber: 'INV/202408/001',
    studentId: 'std-farhan',
    parentId: 'parent-fauzi',
    amount: 450000,
    orderId: 'SPP-INV202408001-100002',
    transactionId: 'TRX-MIDTRANS-998821',
    paymentType: 'gopay',
    transactionStatus: 'cancel' as const,
    createdAt: '2024-08-04T12:00:00Z',
  },
  // Invoice Agustus Farhan - Attempt 3: SETTLED / PAID
  {
    id: 'pay-farhan-aug-3',
    invoiceId: 'inv-202408-farhan',
    invoiceNumber: 'INV/202408/001',
    studentId: 'std-farhan',
    parentId: 'parent-fauzi',
    amount: 450000,
    orderId: 'SPP-INV202408001-100003',
    transactionId: 'TRX-MIDTRANS-998825',
    paymentType: 'bank_transfer_bca',
    transactionStatus: 'settlement' as const,
    settlementTime: '2024-08-05T14:22:00Z',
    createdAt: '2024-08-05T14:15:00Z',
  },
  // Aisyah Juli
  {
    id: 'pay-aisyah-jul',
    invoiceId: 'inv-202407-aisyah',
    invoiceNumber: 'INV/202407/002',
    studentId: 'std-aisyah',
    parentId: 'parent-fauzi',
    amount: 475000,
    orderId: 'SPP-INV202407002-334455',
    transactionId: 'TRX-MIDTRANS-998830',
    paymentType: 'gopay',
    transactionStatus: 'settlement' as const,
    settlementTime: '2024-07-07T11:00:00Z',
    createdAt: '2024-07-07T10:55:00Z',
  },
  // Zaidan September - Pending
  {
    id: 'pay-zaidan-sep',
    invoiceId: 'inv-202409-zaidan',
    invoiceNumber: 'INV/202409/003',
    studentId: 'std-zaidan',
    parentId: 'parent-siti',
    amount: 450000,
    orderId: 'SPP-INV202409003-887766',
    snapToken: 'SANDBOX-SNAP-zaidan-sample',
    paymentType: 'qris',
    transactionStatus: 'pending' as const,
    createdAt: '2024-09-02T08:00:00Z',
  },
  // Maryam September
  {
    id: 'pay-maryam-sep',
    invoiceId: 'inv-202409-maryam',
    invoiceNumber: 'INV/202409/004',
    studentId: 'std-maryam',
    parentId: 'parent-ridwan',
    amount: 450000,
    orderId: 'SPP-INV202409004-556677',
    transactionId: 'TRX-MIDTRANS-998845',
    paymentType: 'qris',
    transactionStatus: 'settlement' as const,
    settlementTime: '2024-09-03T16:45:00Z',
    createdAt: '2024-09-03T16:40:00Z',
  },
];

export async function seedInitialDatabase() {
  try {
    // Check if classes exist
    const classesSnap = await getDocs(collection(db, 'classes'));
    if (!classesSnap.empty) {
      console.log('Database already has data, skipping full seed');
      return { seeded: false, message: 'Data already exists' };
    }

    const batch = writeBatch(db);

    // 1. Classes
    for (const cls of SEED_CLASSES) {
      batch.set(doc(db, 'classes', cls.id), {
        ...cls,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. SPP Settings
    for (const spp of SEED_SPP_SETTINGS) {
      batch.set(doc(db, 'spp_settings', spp.id), {
        ...spp,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Parents
    for (const parent of SEED_PARENTS) {
      batch.set(doc(db, 'parents', parent.id), {
        ...parent,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Students
    for (const std of SEED_STUDENTS) {
      batch.set(doc(db, 'students', std.id), {
        ...std,
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Invoices
    for (const inv of SEED_INVOICES) {
      batch.set(doc(db, 'invoices', inv.id), {
        ...inv,
      });
    }

    // 6. Payments
    for (const pay of SEED_PAYMENTS) {
      batch.set(doc(db, 'payments', pay.id), {
        ...pay,
      });
    }

    // 7. School profile
    batch.set(doc(db, 'settings', 'school_profile'), INITIAL_SCHOOL_PROFILE);

    await batch.commit();
    console.log('Initial database seeded successfully');
    return { seeded: true, message: 'Seed completed successfully' };
  } catch (error: any) {
    console.error('Seed database error:', error);
    throw error;
  }
}
