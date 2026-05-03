import { ReportType } from "../types";

export function generateManualReport(data: any, type: ReportType, centreName: string = "EKET") {
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  let periodStr = "";
  if (data.reportDate) periodStr = `FOR ${data.reportDate}`;
  else if (data.month && data.year) periodStr = `FOR THE MONTH OF ${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' }).toUpperCase()} ${data.year}`;
  else if (data.quarter && data.year) periodStr = `FOR QUARTER ${data.quarter}, ${data.year}`;
  else if (data.year) periodStr = `FOR THE YEAR ${data.year}`;

  return `
# FEDERAL ROAD SAFETY CORPS
## DRIVERS LICENSE CENTRE (DLC) - ${centreName.toUpperCase()}

**INTERNAL MEMORANDUM**

**FROM:** Officer-In-Charge, DLC ${centreName.toUpperCase()}
**TO:** Sector Commander, RS[ZONE].[UNIT]
**INFO:** Zonal Commanding Officer
**DATE:** ${date}

---

### SUBJECT: ${type.toUpperCase()} OPERATIONAL REPORT ${periodStr}

#### 1. OVERVIEW
The operational activities at the Drivers License Centre (DLC) ${centreName.toUpperCase()} for the period under review have been compiled. Below is a detailed breakdown of production metrics, demographic analysis, and classification distribution.

#### 2. PRODUCTION SUMMARY (FORMS RECEIVED & PROCESSED)
A total of **${data.totalProduction}** applications were processed during this period.

| CATEGORY | COUNT | PERCENTAGE |
| :--- | :--- | :--- |
| **Fresh Issuance** | ${data.fresh} | ${((data.fresh / data.totalProduction) * 100 || 0).toFixed(1)}% |
| **License Renewal** | ${data.renewal} | ${((data.renewal / data.totalProduction) * 100 || 0).toFixed(1)}% |
| **Re-Issuance** | ${data.reissue} | ${((data.reissue / data.totalProduction) * 100 || 0).toFixed(1)}% |
| **TOTALS** | **${data.totalProduction}** | **100%** |

#### 3. DEMOGRAPHIC ANALYSIS (GENDER & AGE)

**GENDER DISTRIBUTION**
- **Male Applicants:** ${data.male}
- **Female Applicants:** ${data.female}

**AGE GROUP BREAKDOWN**
| AGE RANGE | COUNT |
| :--- | :--- |
| **18 - 25 Years** | ${data.age18_25} |
| **26 - 60 Years** | ${data.age26_60} |
| **60+ Years** | ${data.age60plus} |

#### 4. SUMMARY BY CLASS OF LICENSE
The distribution across vehicle classes is summarized as follows:

| CLASS | COUNT | DESCRIPTION |
| :--- | :--- | :--- |
| **A** | ${data.clsA} | Motorcycle |
| **B** | ${data.clsB} | Private Car (Automatic) |
| **C** | ${data.clsC} | Private/Commercial Car |
| **D** | ${data.clsD} | Light Vehicles |
| **E** | ${data.clsE} | Heavy Duty Vehicles |
| **F** | ${data.clsF} | Agricultural Machinery |
| **G** | ${data.clsG} | Articulated Vehicles |
| **H** | ${data.clsH} | Earth-moving Equipment |
| **J** | ${data.clsJ} | Special Category |

#### 5. REMARKS / OPERATIONAL LOGS
${data.remarks || "No significant incidents or deviations reported for this period. Operations remained baseline as per standard protocol."}

#### 6. CONCLUSION
The centre continues to maintain efficient service delivery in accordance with the FRSC national standards for driver license processing.

**SIGNED,**

*(DIGITALLY VERIFIED)*
**Officer-In-Charge**
DLC ${centreName.toUpperCase()}
FRSC NIGERIA
`;
}

export function generateQuarterlyReport(data: any, centreName: string, quarter: number, year: number, officerName: string) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const startMonthIdx = (quarter - 1) * 3;
  const m1 = monthNames[startMonthIdx];
  const m2 = monthNames[startMonthIdx + 1];
  const m3 = monthNames[startMonthIdx + 2];

  // Aggregate monthly data
  const monthlyData = [
    { name: m1, prod: 0, v3: 0, v5: 0, bf: 0, rec: 0, used: 0, dam: 0, cf: 0 },
    { name: m2, prod: 0, v3: 0, v5: 0, bf: 0, rec: 0, used: 0, dam: 0, cf: 0 },
    { name: m3, prod: 0, v3: 0, v5: 0, bf: 0, rec: 0, used: 0, dam: 0, cf: 0 }
  ];

  data.reports.forEach((r: any) => {
    const rMonth = parseInt(r.date.split('-')[1], 10) - 1; // 0-indexed month
    if (rMonth === startMonthIdx) {
      monthlyData[0].prod += r.totalProduction;
      monthlyData[0].v3 += (r.validity3Yr || 0);
      monthlyData[0].v5 += (r.validity5Yr || 0);
      monthlyData[0].rec += (r.received || 0);
      monthlyData[0].used += (r.claimed || 0);
      monthlyData[0].dam += (r.damaged || 0);
    } else if (rMonth === startMonthIdx + 1) {
      monthlyData[1].prod += r.totalProduction;
      monthlyData[1].v3 += (r.validity3Yr || 0);
      monthlyData[1].v5 += (r.validity5Yr || 0);
      monthlyData[1].rec += (r.received || 0);
      monthlyData[1].used += (r.claimed || 0);
      monthlyData[1].dam += (r.damaged || 0);
    } else if (rMonth === startMonthIdx + 2) {
      monthlyData[2].prod += r.totalProduction;
      monthlyData[2].v3 += (r.validity3Yr || 0);
      monthlyData[2].v5 += (r.validity5Yr || 0);
      monthlyData[2].rec += (r.received || 0);
      monthlyData[2].used += (r.claimed || 0);
      monthlyData[2].dam += (r.damaged || 0);
    }
  });

  // Calculate B/F and C/F sequentially for the 3 months
  // If we have a real starting B/F for the quarter, we would use it, but for now we'll sum or use data.balBF as starting point
  let currentBF = data.reports.length > 0 ? data.reports.sort((a:any, b:any) => a.date.localeCompare(b.date))[0].balBF || 0 : 0;
  
  monthlyData.forEach(m => {
    m.bf = currentBF;
    m.cf = (m.bf + m.rec) - (m.used + m.dam);
    currentBF = m.cf; // Carry forward to next month
  });

  const totProd = monthlyData.reduce((a, b) => a + b.prod, 0);
  const totV3 = monthlyData.reduce((a, b) => a + b.v3, 0);
  const totV5 = monthlyData.reduce((a, b) => a + b.v5, 0);
  
  const amtV3 = (qty: number) => qty * 15000;
  const amtV5 = (qty: number) => qty * 21000;

  return `
ROAD SAFETY CORPS
RS6.32 ${centreName.toUpperCase()} DLC

DLC ${centreName.toUpperCase()} ${quarter}${quarter === 1 ? 'ST' : quarter === 2 ? 'ND' : quarter === 3 ? 'RD' : 'TH'} QUARTER (${m1.substring(0,3).toUpperCase()}-${m3.substring(0,3).toUpperCase()}) ${year} SUMMARY OF EXPENDITURE

| EXPENSE ITEM | ${m1} | ${m2} | ${m3} | TOTAL |
| :--- | :--- | :--- | :--- | :--- |
| INCOME (#) | 0 | 0 | 0 | 0 |
| BALANCE B/F | 0 | 0 | 0 | 0 |
| ALLOCATION | 31, 800 | 31, 800 | 31, 800 | 95,400 |
| TOTAL | 31800 | 31800 | 31800 | 95,400 |
| EXPENDITURE | | | | |
| STATIONARY | 8000 | 8000 | 8000 | 24000 |
| FUELLING OF GENERATOR | 23800 | 23800 | 23800 | 71,400 |
| REMITA/CBN CHARGES | 0 | 0 | 0 | 0 |
| TOTAL EXPENDITURE | 31,800 | 31,800 | 31,800 | 95,400 |
| BALANCE C/F | 0 | 0 | 0 | 0 |

SRC UC ESSIEN                            DRC, ${officerName.toUpperCase()}
HEAD DLC, ${centreName.toUpperCase()}                           AHR DLC ${centreName.toUpperCase()}

---

FEDERAL ROAD SAFETY CORPS
COMMAND: RS6.32 DLC ${centreName.toUpperCase()} WORKSTATION

AUDIT REPORT

${quarter}${quarter === 1 ? 'st' : quarter === 2 ? 'nd' : quarter === 3 ? 'rd' : 'th'} QUARTER (${m1.substring(0,3).toUpperCase()}-${m3.substring(0,3).toUpperCase()}) ${year} REPORT

| MONTH | QTY PROD | 15000 QTY | 15000 AMOUNT | 21000 QTY | 21000 AMOUNT | TOTAL AMOUNT | Amount due to FRSC | Amount due to State BIR |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ${m1.substring(0,3).toUpperCase()} | ${monthlyData[0].prod} | ${monthlyData[0].v3} | ${amtV3(monthlyData[0].v3).toLocaleString()} | ${monthlyData[0].v5} | ${amtV5(monthlyData[0].v5).toLocaleString()} | ${(amtV3(monthlyData[0].v3) + amtV5(monthlyData[0].v5)).toLocaleString()} | ${((amtV3(monthlyData[0].v3) + amtV5(monthlyData[0].v5))/2).toLocaleString()} | ${((amtV3(monthlyData[0].v3) + amtV5(monthlyData[0].v5))/2).toLocaleString()} |
| ${m2.substring(0,3).toUpperCase()} | ${monthlyData[1].prod} | ${monthlyData[1].v3} | ${amtV3(monthlyData[1].v3).toLocaleString()} | ${monthlyData[1].v5} | ${amtV5(monthlyData[1].v5).toLocaleString()} | ${(amtV3(monthlyData[1].v3) + amtV5(monthlyData[1].v5)).toLocaleString()} | ${((amtV3(monthlyData[1].v3) + amtV5(monthlyData[1].v5))/2).toLocaleString()} | ${((amtV3(monthlyData[1].v3) + amtV5(monthlyData[1].v5))/2).toLocaleString()} |
| ${m3.substring(0,3).toUpperCase()} | ${monthlyData[2].prod} | ${monthlyData[2].v3} | ${amtV3(monthlyData[2].v3).toLocaleString()} | ${monthlyData[2].v5} | ${amtV5(monthlyData[2].v5).toLocaleString()} | ${(amtV3(monthlyData[2].v3) + amtV5(monthlyData[2].v5)).toLocaleString()} | ${((amtV3(monthlyData[2].v3) + amtV5(monthlyData[2].v5))/2).toLocaleString()} | ${((amtV3(monthlyData[2].v3) + amtV5(monthlyData[2].v5))/2).toLocaleString()} |
| TOTAL | ${totProd} | ${totV3} | ${amtV3(totV3).toLocaleString()} | ${totV5} | ${amtV5(totV5).toLocaleString()} | ${(amtV3(totV3) + amtV5(totV5)).toLocaleString()} | ${((amtV3(totV3) + amtV5(totV5))/2).toLocaleString()} | ${((amtV3(totV3) + amtV5(totV5))/2).toLocaleString()} |

SRC UC ESSIEN                            DRC, ${officerName.toUpperCase()}
HEAD DLC, ${centreName.toUpperCase()}                           AHR DLC ${centreName.toUpperCase()}

---

RS6.32 DLC ${centreName.toUpperCase()}
NDL BASE STOCK ANALYSIS FROM ${m1.substring(0,3).toUpperCase()}-${m3.substring(0,3).toUpperCase()} ${year}

| DATE | ITEM RECEIVED | B/F | QTY RECIEVED | TOTAL | QTY USED | QTY DAMAGED | BAL C/F |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ${m1.substring(0,3).toUpperCase()} | BASE STOCK | ${monthlyData[0].bf} | ${monthlyData[0].rec} | ${monthlyData[0].bf + monthlyData[0].rec} | ${monthlyData[0].used} | ${monthlyData[0].dam} | ${monthlyData[0].cf} |
| ${m2.substring(0,3).toUpperCase()} | BASE STOCK | ${monthlyData[1].bf} | ${monthlyData[1].rec} | ${monthlyData[1].bf + monthlyData[1].rec} | ${monthlyData[1].used} | ${monthlyData[1].dam} | ${monthlyData[1].cf} |
| ${m3.substring(0,3).toUpperCase()} | BASE STOCK | ${monthlyData[2].bf} | ${monthlyData[2].rec} | ${monthlyData[2].bf + monthlyData[2].rec} | ${monthlyData[2].used} | ${monthlyData[2].dam} | ${monthlyData[2].cf} |

PREPARED BY                              CHECKED BY                               AUTHORIZED BY

DCRMA PATRICIA IBANGA                    DRC, ${officerName.toUpperCase()}                        SRC UC ESSIEN
DLC AHR                                  DLC AHR                                  DLC HEAD
`;
}
