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
