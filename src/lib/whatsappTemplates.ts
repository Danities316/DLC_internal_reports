import { DailyReport, AuthSession } from "../types";

export function generateDailyWhatsAppReport(data: any, session: AuthSession) {
  const date = new Date(data.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const centre = session.centreId.split('-').pop() || session.centreId;

  return `${centre}
DAILY REPORTS ${date}

TOTAL PRODUCTION = ${data.totalProduction}

FRESHS = ${data.fresh}
RENEWAL = ${data.renewal}
REISSUE = ${data.reissue}

MALE = ${data.male}
FEMALE = ${data.female}

CLASSES OF LICENCE
A = ${data.classes.A}
B = ${data.classes.B}
C = ${data.classes.C}
D = ${data.classes.D}
E = ${data.classes.E}
F = ${data.classes.F}
G = ${data.classes.G}
H = ${data.classes.H}
J = ${data.classes.J}

BREAKDOWN BY AGE

18 - 25 = ${data.ageGroups["18-25"]}
25 - 60 = ${data.ageGroups["26-60"]}
60 & ABOVE = ${data.ageGroups["60+"]}

REMARKS = ${data.remarks || "NIL"}

OFFICER ${session.name.toUpperCase()}
UAHR, ${centre}`;
}

export function generateWeeklyWhatsAppReport(data: any, session: AuthSession) {
  const dateObj = new Date(data.startDate);
  
  // Calculate Week Number
  const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
  const pastDaysOfYear = (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  const dateRange = `${new Date(data.startDate).toLocaleDateString('en-GB')} - ${new Date(data.endDate).toLocaleDateString('en-GB')}`;
  const centre = session.centreId.split('-').pop() || session.centreId;

  return `${centre}
WEEKLY REPORT OF WEEK ${weekNum} (${dateRange})

TOTAL PRODUCTION = ${data.totalProduction}

FRESH = ${data.fresh}
RENEWAL = ${data.renewal}
REISSUE = ${data.reissue}

NO OF MALE = ${data.male}
NO OF FEMALE = ${data.female}

CLASSES OF LICENCE
A = ${data.classes.A}
B = ${data.classes.B}
C = ${data.classes.C}
D = ${data.classes.D}
E = ${data.classes.E}
F = ${data.classes.F}
G = ${data.classes.G}
H = ${data.classes.H}
J = ${data.classes.J}

BREAKDOWN BY AGE

18 - 25 = ${data.ageGroups["18-25"]}
25 - 60 = ${data.ageGroups["26-60"]}
60 & ABOVE = ${data.ageGroups["60+"]}

BAL B/F:
TOTAL ${data.balBF}

RECIEVED FROM PRINT FARM: ${data.received}

CLAIMED: ${data.claimed}

BAL C/F: ${data.balCF}


OFFICER ${session.name.toUpperCase()}
UAHR, ${centre}`;
}
