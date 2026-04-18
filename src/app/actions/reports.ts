"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DailyReport, ReportType } from "@/types";
import { reportService } from "@/lib/reportService";
import { generateManualReport } from "@/lib/reportTemplate";

export async function saveDailyReport(data: any) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

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

  const text = generateManualReport(aggregatedData, type, session.centreId);
  return { text };
}
