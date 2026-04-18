import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DailyReport, ReportType } from "../types";

export const reportService = {
  /**
   * Fetches daily reports within a date range and aggregates them.
   */
  async getAggregatedData(startDate: string, endDate: string, centreId: string) {
    const q = query(
      collection(db, "dailyReports"),
      where("centreId", "==", centreId),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );

    const snapshot = await getDocs(q);
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyReport));

    if (reports.length === 0) return null;

    const aggregated = {
      totalProduction: 0,
      fresh: 0,
      renewal: 0,
      reissue: 0,
      male: 0,
      female: 0,
      classes: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, J: 0 },
      ageGroups: { "18-25": 0, "26-60": 0, "60+": 0 },
      reportCount: reports.length,
      startDate,
      endDate,
      reports // Raw reports for detailed analysis if needed
    };

    reports.forEach(r => {
      aggregated.totalProduction += r.totalProduction;
      aggregated.fresh += r.fresh;
      aggregated.renewal += r.renewal;
      aggregated.reissue += r.reissue;
      aggregated.male += r.male;
      aggregated.female += r.female;
      
      Object.keys(r.classes).forEach(cls => {
        (aggregated.classes as any)[cls] += (r.classes as any)[cls];
      });
      
      Object.keys(r.ageGroups).forEach(age => {
        (aggregated.ageGroups as any)[age] += (r.ageGroups as any)[age];
      });
    });

    return aggregated;
  },

  /**
   * Wrapper for Weekly
   */
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

  /**
   * Wrapper for Monthly
   */
  async getMonthlyReport(year: number, month: number, centreId: string) {
    const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    return this.getAggregatedData(start, end, centreId);
  },

  /**
   * Wrapper for Quarterly
   */
  async getQuarterlyReport(year: number, quarter: number, centreId: string) {
    const startMonth = (quarter - 1) * 3;
    const start = new Date(year, startMonth, 1).toISOString().split('T')[0];
    const end = new Date(year, startMonth + 3, 0).toISOString().split('T')[0];
    return this.getAggregatedData(start, end, centreId);
  },

  /**
   * Wrapper for Annual
   */
  async getAnnualReport(year: number, centreId: string) {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    return this.getAggregatedData(start, end, centreId);
  }
};
