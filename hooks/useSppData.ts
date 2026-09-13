'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Student,
  ClassItem,
  SppSetting,
  Invoice,
  PaymentAttempt,
  Parent,
  SchoolProfile,
  InvoiceStatus,
} from '@/types';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  INITIAL_SCHOOL_PROFILE,
  SEED_CLASSES,
  SEED_SPP_SETTINGS,
  SEED_STUDENTS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_PARENTS,
} from '@/lib/seed-data';

export function useSppData() {
  const [classes, setClasses] = useState<ClassItem[]>(SEED_CLASSES);
  const [sppSettings, setSppSettings] = useState<SppSetting[]>(SEED_SPP_SETTINGS);
  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [payments, setPayments] = useState<PaymentAttempt[]>(SEED_PAYMENTS);
  const [parents, setParents] = useState<Parent[]>(SEED_PARENTS);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(INITIAL_SCHOOL_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all data from Firestore, or fallback to seeds if empty
  const fetchData = useCallback(async () => {
    try {
      // Classes
      const clsSnap = await getDocs(collection(db, 'classes'));
      if (!clsSnap.empty) {
        const clsList: ClassItem[] = [];
        clsSnap.forEach((d) => clsList.push({ id: d.id, ...d.data() } as ClassItem));
        setClasses(clsList);
      }

      // SPP Settings
      const sppSnap = await getDocs(collection(db, 'spp_settings'));
      if (!sppSnap.empty) {
        const sppList: SppSetting[] = [];
        sppSnap.forEach((d) => sppList.push({ id: d.id, ...d.data() } as SppSetting));
        setSppSettings(sppList);
      }

      // Students
      const stdSnap = await getDocs(collection(db, 'students'));
      if (!stdSnap.empty) {
        const stdList: Student[] = [];
        stdSnap.forEach((d) => stdList.push({ id: d.id, ...d.data() } as Student));
        setStudents(stdList);
      }

      // Parents
      const prtSnap = await getDocs(collection(db, 'parents'));
      if (!prtSnap.empty) {
        const prtList: Parent[] = [];
        prtSnap.forEach((d) => prtList.push({ id: d.id, ...d.data() } as Parent));
        setParents(prtList);
      }

      // Invoices
      const invSnap = await getDocs(collection(db, 'invoices'));
      if (!invSnap.empty) {
        const invList: Invoice[] = [];
        invSnap.forEach((d) => invList.push({ id: d.id, ...d.data() } as Invoice));
        setInvoices(invList);
      }

      // Payments
      const paySnap = await getDocs(collection(db, 'payments'));
      if (!paySnap.empty) {
        const payList: PaymentAttempt[] = [];
        paySnap.forEach((d) => payList.push({ id: d.id, ...d.data() } as PaymentAttempt));
        setPayments(payList);
      }
    } catch (err) {
      console.warn('Firestore fetch warning (using seeded fallback):', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await fetchData();
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, [fetchData]);

  // Seed / Reset Database
  const resetToDemoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error('Seed API error:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate monthly SPP invoices with duplicate prevention!
   * Requirement: "Jangan membuat invoice ganda untuk siswa dan bulan yang sama."
   */
  const generateMonthlyInvoices = async (params: {
    classId: string; // 'all' or specific classId
    month: number;
    year: number;
    academicYear: string;
    dueDate: string;
  }) => {
    const targetStudents = params.classId === 'all'
      ? students.filter((s) => s.status === 'active')
      : students.filter((s) => s.classId === params.classId && s.status === 'active');

    let generatedCount = 0;
    let skippedCount = 0;
    const newInvoices: Invoice[] = [];

    for (const student of targetStudents) {
      // Check duplicate in current state / database
      const isDuplicate = invoices.some(
        (inv) =>
          inv.studentId === student.id &&
          inv.month === params.month &&
          inv.year === params.year
      );

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      // Find monthly fee for student's class
      const setting = sppSettings.find((s) => s.classId === student.classId);
      const amount = setting ? setting.monthlyFee : 450000;

      const dateCode = `${params.year}${String(params.month).padStart(2, '0')}`;
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV/${dateCode}/${student.nis}-${randomSeq}`;
      const invoiceId = `inv-${dateCode}-${student.id}`;

      const newInv: Invoice = {
        id: invoiceId,
        invoiceNumber,
        studentId: student.id,
        studentName: student.name,
        studentNis: student.nis,
        classId: student.classId,
        className: student.className,
        parentId: student.parentId,
        parentName: student.parentName,
        month: params.month,
        year: params.year,
        academicYear: params.academicYear,
        amount,
        status: 'UNPAID',
        dueDate: params.dueDate,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'invoices', invoiceId), newInv);
      } catch (e) {
        console.warn('Firestore setDoc failed, saving locally:', e);
      }

      newInvoices.push(newInv);
      generatedCount++;
    }

    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);
    }

    return { generatedCount, skippedCount };
  };

  // Add Student
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const id = `std-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'students', id), newStudent);
    } catch (e) {
      console.warn('Firestore save failed, updating locally:', e);
    }

    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  };

  // Update Student
  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await updateDoc(doc(db, 'students', id), updates);
    } catch (e) {
      console.warn('Firestore update failed, updating locally:', e);
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Delete Student
  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (e) {
      console.warn('Firestore delete failed, updating locally:', e);
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Add Class
  const addClass = async (classData: Omit<ClassItem, 'id' | 'createdAt'>) => {
    const id = `cls-${Date.now()}`;
    const newClass: ClassItem = {
      ...classData,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'classes', id), newClass);
    } catch (e) {
      console.warn('Firestore save failed:', e);
    }

    setClasses((prev) => [...prev, newClass]);
    return newClass;
  };

  // Update SPP Tariff
  const updateSppTariff = async (id: string, monthlyFee: number, description?: string) => {
    try {
      await updateDoc(doc(db, 'spp_settings', id), {
        monthlyFee,
        description: description || '',
      });
    } catch (e) {
      console.warn('Firestore update failed:', e);
    }

    setSppSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, monthlyFee, description: description || s.description } : s))
    );
  };

  // Manual payment recording (e.g. cash paid at administration office)
  const markInvoicePaidManual = async (
    invoiceId: string,
    paymentMethod: string = 'TUNAI (KASIR)'
  ) => {
    const nowIso = new Date().toISOString();
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    // Create payment attempt record
    const paymentId = `pay-manual-${Date.now()}`;
    const paymentRecord: PaymentAttempt = {
      id: paymentId,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      studentId: invoice.studentId,
      parentId: invoice.parentId,
      amount: invoice.amount,
      paymentType: paymentMethod.toLowerCase(),
      orderId: `MANUAL-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
      transactionStatus: 'settlement',
      settlementTime: nowIso,
      createdAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'payments', paymentId), paymentRecord);
      await updateDoc(doc(db, 'invoices', invoiceId), {
        status: 'PAID',
        paidAt: nowIso,
        paymentMethod,
        activePaymentId: paymentId,
        updatedAt: nowIso,
      });
    } catch (e) {
      console.warn('Firestore update failed, updating locally:', e);
    }

    setPayments((prev) => [paymentRecord, ...prev]);
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              status: 'PAID',
              paidAt: nowIso,
              paymentMethod,
              activePaymentId: paymentId,
            }
          : i
      )
    );
  };

  return {
    classes,
    sppSettings,
    students,
    invoices,
    payments,
    parents,
    schoolProfile,
    loading,
    refreshData: fetchData,
    resetToDemoData,
    generateMonthlyInvoices,
    addStudent,
    updateStudent,
    deleteStudent,
    addClass,
    updateSppTariff,
    markInvoicePaidManual,
  };
}
