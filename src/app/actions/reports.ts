"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DailyReport, ReportType } from "@/types";
import { reportService } from "@/lib/reportService";
import { generateManualReport, generateQuarterlyReport } from "@/lib/reportTemplate";
import { generateDailyWhatsAppReport, generateWeeklyWhatsAppReport } from "@/lib/whatsappTemplates";

/**
 * Fetch the previous day's Bal C/F for auto-populating today's Bal B/F.
 * Finds the most recent report BEFORE the given date for this centre.
 */
export async function getPreviousBalance(date: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const previousReport = await prisma.dailyReport.findFirst({
    where: {
      centreId: session.centreId,
      date: { lt: date },
    },
    orderBy: { date: "desc" },
    select: { balCF: true, claimed: true, date: true },
  });

  return {
    balBF: previousReport?.balCF ?? 0,
    previousDate: previousReport?.date ?? null,
  };
}

/**
 * Check if a report already exists for this date + centre.
 */
export async function checkDateExists(date: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const existing = await prisma.dailyReport.findUnique({
    where: {
      date_centreId: {
        date,
        centreId: session.centreId,
      },
    },
    select: { id: true, totalProduction: true, createdAt: true },
  });

  return {
    exists: !!existing,
    report: existing,
  };
}

export async function saveDailyReport(data: any) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Server-side date validation: non-admins can only submit for today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  if (data.date !== todayStr && session.role !== 'admin') {
    return { error: "You can only submit a report for today's date. Contact your admin for corrections." };
  }

  // Check for existing report (non-admins cannot overwrite)
  const existing = await prisma.dailyReport.findUnique({
    where: {
      date_centreId: {
        date: data.date,
        centreId: session.centreId,
      },
    },
  });

  if (existing && session.role !== 'admin') {
    return { error: `A report for ${data.date} already exists. Contact your admin to modify it.` };
  }

  try {
    const report = await prisma.dailyReport.upsert({
      where: {
        date_centreId: {
          date: data.date,
          centreId: session.centreId
        }
      },
      update: {
        totalProduction: data.totalProduction,
        fresh: data.fresh,
        renewal: data.renewal,
        reissue: data.reissue,
        male: data.male,
        female: data.female,
        remarks: data.remarks,
        clsA: data.classes.A,
        clsB: data.classes.B,
        clsC: data.classes.C,
        clsD: data.classes.D,
        clsE: data.classes.E,
        clsF: data.classes.F,
        clsG: data.classes.G,
        clsH: data.classes.H,
        clsJ: data.classes.J,
        age18_25: data.ageGroups["18-25"],
        age26_60: data.ageGroups["26-60"],
        age60plus: data.ageGroups["60+"],
        validity3Yr: data.validity3Yr,
        validity5Yr: data.validity5Yr,
        balBF: data.balBF,
        received: data.received,
        damaged: data.damaged,
        claimed: data.claimed,
        balCF: data.balCF,
      },
      create: {
        date: data.date,
        centreId: session.centreId,
        userId: session.userId,
        totalProduction: data.totalProduction,
        fresh: data.fresh,
        renewal: data.renewal,
        reissue: data.reissue,
        male: data.male,
        female: data.female,
        remarks: data.remarks,
        clsA: data.classes.A,
        clsB: data.classes.B,
        clsC: data.classes.C,
        clsD: data.classes.D,
        clsE: data.classes.E,
        clsF: data.classes.F,
        clsG: data.classes.G,
        clsH: data.classes.H,
        clsJ: data.classes.J,
        age18_25: data.ageGroups["18-25"],
        age26_60: data.ageGroups["26-60"],
        age60plus: data.ageGroups["60+"],
        validity3Yr: data.validity3Yr,
        validity5Yr: data.validity5Yr,
        balBF: data.balBF,
        received: data.received,
        damaged: data.damaged,
        claimed: data.claimed,
        balCF: data.balCF,
      }
    });

    return { success: true, id: report.id };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save report" };
  }
}

export async function getDashboardStats() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const last10 = await reportService.getAggregatedData(
    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0],
    session.centreId
  );

  return last10;
}

export async function getSimplifiedStats() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  
  const [today, week, month] = await Promise.all([
    reportService.getAggregatedData(todayStr, todayStr, session.centreId),
    reportService.getWeeklyReport(todayStr, session.centreId),
    reportService.getMonthlyReport(now.getFullYear(), now.getMonth() + 1, session.centreId)
  ]);

  return {
    today: today.totalProduction,
    week: week.totalProduction,
    month: month.totalProduction
  };
}

export async function generateReport(type: ReportType, params: any) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  let aggregatedData;
  const { date, month, year, quarter } = params;

  if (type === 'daily') {
    aggregatedData = await reportService.getAggregatedData(date, date, session.centreId);
  } else if (type === 'weekly') {
    aggregatedData = await reportService.getWeeklyReport(date, session.centreId);
  } else if (type === 'monthly') {
    aggregatedData = await reportService.getMonthlyReport(year, month, session.centreId);
  } else if (type === 'quarterly') {
    aggregatedData = await reportService.getQuarterlyReport(year, quarter, session.centreId);
  } else {
    aggregatedData = await reportService.getAnnualReport(year, session.centreId);
  }

  if (!aggregatedData) throw new Error("No data found for period");

  let text = "";
  if (type === 'daily') {
    text = generateDailyWhatsAppReport(aggregatedData, session);
  } else if (type === 'weekly') {
    text = generateWeeklyWhatsAppReport(aggregatedData, session);
  } else if (type === 'quarterly') {
    text = generateQuarterlyReport(aggregatedData, session.centreId, quarter, year, session.name);
  } else {
    text = generateManualReport(aggregatedData, type, session.centreId);
  }

  return { 
    text,
    format: (type === 'daily' || type === 'weekly') ? 'whatsapp' : 'document'
  };
}
