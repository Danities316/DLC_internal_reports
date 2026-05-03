import { prisma } from "./prisma";
import { DailyReport, ReportType } from "../types";

export const reportService = {
  async getAggregatedData(startDate: string, endDate: string, centreId: string) {
    const rawReports = await prisma.dailyReport.findMany({
      where: {
        centreId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    if (rawReports.length === 0) {
      return {
        totalProduction: 0,
        fresh: 0,
        renewal: 0,
        reissue: 0,
        male: 0,
        female: 0,
        classes: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, J: 0 },
        ageGroups: { "18-25": 0, "26-60": 0, "60+": 0 },
        reportCount: 0,
        startDate,
        endDate,
        reports: []
      };
    }

    // Map Prisma models to DailyReport interface for consistent usage
    const reports: DailyReport[] = rawReports.map(r => ({
      id: r.id,
      date: r.date,
      centreId: r.centreId,
      totalProduction: r.totalProduction,
      fresh: r.fresh,
      renewal: r.renewal,
      reissue: r.reissue,
      male: r.male,
      female: r.female,
      classes: {
        A: r.clsA,
        B: r.clsB,
        C: r.clsC,
        D: r.clsD,
        E: r.clsE,
        F: r.clsF,
        G: r.clsG,
        H: r.clsH,
        J: r.clsJ,
      },
      ageGroups: {
        "18-25": r.age18_25,
        "26-60": r.age26_60,
        "60+": r.age60plus,
      },
      remarks: r.remarks || undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      createdBy: r.userId,
      validity3Yr: r.validity3Yr,
      validity5Yr: r.validity5Yr,
      balBF: r.balBF,
      received: r.received,
      damaged: r.damaged,
      claimed: r.claimed,
      balCF: r.balCF
    }));

    const aggregated = {
      totalProduction: 0,
      fresh: 0,
      renewal: 0,
      reissue: 0,
      male: 0,
      female: 0,
      classes: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, J: 0 },
      ageGroups: { "18-25": 0, "26-60": 0, "60+": 0 },
      validity3Yr: 0,
      validity5Yr: 0,
      balBF: 0,
      received: 0,
      damaged: 0,
      claimed: 0,
      balCF: 0,
      reportCount: reports.length,
      startDate,
      endDate,
      reports
    };

    reports.forEach(r => {
      aggregated.totalProduction += r.totalProduction;
      aggregated.fresh += r.fresh;
      aggregated.renewal += r.renewal;
      aggregated.reissue += r.reissue;
      aggregated.male += r.male;
      aggregated.female += r.female;
      aggregated.validity3Yr += r.validity3Yr;
      aggregated.validity5Yr += r.validity5Yr;
      aggregated.balBF += r.balBF;
      aggregated.received += r.received;
      aggregated.damaged += r.damaged;
      aggregated.claimed += r.claimed;
      aggregated.balCF += r.balCF;
      
      Object.keys(r.classes).forEach(cls => {
        (aggregated.classes as any)[cls] += (r.classes as any)[cls];
      });
      
      Object.keys(r.ageGroups).forEach(age => {
        (aggregated.ageGroups as any)[age] += (r.ageGroups as any)[age];
      });
    });

    return aggregated;
  },

  async getWeeklyReport(date: string, centreId: string) {
    const d = new Date(date);
    const day = d.getDay() || 7;
    const monday = new Date(d);
    monday.setHours(0,0,0,0);
    monday.setDate(d.getDate() - day + 1);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    return this.getAggregatedData(
      monday.toISOString().split('T')[0],
      sunday.toISOString().split('T')[0],
      centreId
    );
  },

  async getMonthlyReport(year: number, month: number, centreId: string) {
    const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    return this.getAggregatedData(start, end, centreId);
  },

  async getQuarterlyReport(year: number, quarter: number, centreId: string) {
    const startMonth = (quarter - 1) * 3;
    const start = new Date(year, startMonth, 1).toISOString().split('T')[0];
    const end = new Date(year, startMonth + 3, 0).toISOString().split('T')[0];
    return this.getAggregatedData(start, end, centreId);
  },

  async getAnnualReport(year: number, centreId: string) {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    return this.getAggregatedData(start, end, centreId);
  }
};
