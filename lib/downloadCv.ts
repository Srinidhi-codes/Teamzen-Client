import { jsPDF } from "jspdf";
import moment from "moment";

type CvUser = Record<string, any>;

function pick(user: CvUser, ...keys: string[]) {
  for (const key of keys) {
    const value = user?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function textOr(value: unknown, fallback = "—") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  const m = moment(date);
  return m.isValid() ? m.format("D MMM YYYY") : "—";
}

function formatEmploymentType(raw?: string | null) {
  if (!raw) return "Full time";
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function relationName(value: any): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (value.name) return value.name;
  if (value.firstName || value.first_name) {
    return `${value.firstName || value.first_name || ""} ${value.lastName || value.last_name || ""}`.trim();
  }
  return "—";
}

/**
 * Professional employee profile PDF (resume-style structure).
 */
export const handleDownloadCV = (user: CvUser) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const MARGIN = 18;
  const CONTENT_W = pageW - MARGIN * 2;
  const SIDEBAR_W = 58;
  const GAP = 8;
  const MAIN_X = MARGIN + SIDEBAR_W + GAP;
  const MAIN_W = CONTENT_W - SIDEBAR_W - GAP;

  const COLORS = {
    ink: [28, 32, 38] as const,
    muted: [100, 108, 118] as const,
    soft: [140, 148, 158] as const,
    line: [220, 224, 228] as const,
    sidebar: [246, 247, 249] as const,
    accent: [45, 106, 128] as const, // steel blue, brand-adjacent
    white: [255, 255, 255] as const,
  };

  const firstName = pick(user, "firstName", "first_name") || "";
  const lastName = pick(user, "lastName", "last_name") || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Employee";
  const email = textOr(pick(user, "email"));
  const phone = textOr(pick(user, "phoneNumber", "phone_number"));
  const orgName = textOr(
    user.organization?.name || pick(user, "organization_name"),
    "Organization"
  );
  const designation = relationName(
    pick(user, "designation") || pick(user, "designation_name")
  );
  const department = relationName(
    pick(user, "department") || pick(user, "department_name")
  );
  const office = relationName(
    pick(user, "officeLocation", "office_location_details", "office_location")
  );
  const employeeId = textOr(pick(user, "employeeId", "employee_id", "id"));
  const joined = formatDate(pick(user, "dateOfJoining", "date_of_joining"));
  const tenure = textOr(
    pick(user, "tenureDisplay", "tenure_display"),
    "—"
  );
  const employmentType = formatEmploymentType(
    pick(user, "employmentType", "employment_type")
  );
  const manager = relationName(pick(user, "manager"));
  const attendance = pick(user, "attendanceRate", "attendance_rate");
  const attendanceLabel =
    attendance === null || attendance === undefined
      ? "—"
      : `${Number(attendance)}%`;
  const dob = formatDate(pick(user, "dateOfBirth", "date_of_birth"));
  const gender = textOr(pick(user, "gender"), "—");
  const role = textOr(pick(user, "role"), "employee");

  let sideY = 0;
  let mainY = 0;

  const setFont = (size: number, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  const ensureSpace = (needed: number, isSidebar = false) => {
    const y = isSidebar ? sideY : mainY;
    if (y + needed < pageH - 16) return;
    doc.addPage();
    // redraw sidebar band on new page
    doc.setFillColor(...COLORS.sidebar);
    doc.rect(0, 0, MARGIN + SIDEBAR_W + GAP / 2, pageH, "F");
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 0, 3, pageH, "F");
    sideY = MARGIN;
    mainY = MARGIN;
  };

  // Background sidebar
  doc.setFillColor(...COLORS.sidebar);
  doc.rect(0, 0, MARGIN + SIDEBAR_W + GAP / 2, pageH, "F");
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 3, pageH, "F");

  // ---------- HEADER (main column) ----------
  mainY = MARGIN + 4;
  setFont(22, "bold");
  doc.setTextColor(...COLORS.ink);
  doc.text(fullName, MAIN_X, mainY);
  mainY += 8;

  setFont(11, "normal");
  doc.setTextColor(...COLORS.accent);
  const titleLine = [designation !== "—" ? designation : null, department !== "—" ? department : null]
    .filter(Boolean)
    .join("  ·  ");
  doc.text(titleLine || "Team member", MAIN_X, mainY);
  mainY += 6;

  setFont(9, "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(orgName, MAIN_X, mainY);
  mainY += 8;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(MAIN_X, mainY, MAIN_X + MAIN_W, mainY);
  mainY += 10;

  // ---------- SIDEBAR ----------
  sideY = MARGIN + 4;

  const sidebarHeading = (label: string) => {
    ensureSpace(14, true);
    setFont(8, "bold");
    doc.setTextColor(...COLORS.accent);
    doc.text(label.toUpperCase(), MARGIN, sideY);
    sideY += 2;
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, sideY, MARGIN + SIDEBAR_W - 4, sideY);
    sideY += 5;
  };

  const sidebarItem = (label: string, value: string) => {
    const lines = doc.splitTextToSize(value, SIDEBAR_W - 4);
    ensureSpace(10 + lines.length * 4, true);
    setFont(7.5, "bold");
    doc.setTextColor(...COLORS.soft);
    doc.text(label.toUpperCase(), MARGIN, sideY);
    sideY += 4;
    setFont(9, "normal");
    doc.setTextColor(...COLORS.ink);
    doc.text(lines, MARGIN, sideY);
    sideY += lines.length * 4 + 4;
  };

  sidebarHeading("Contact");
  sidebarItem("Email", email);
  sidebarItem("Phone", phone);
  sidebarItem("Office", office);

  sidebarHeading("Identity");
  sidebarItem("Employee ID", employeeId);
  sidebarItem("Role", role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  if (dob !== "—" || gender !== "—") {
    sidebarItem("Date of birth", dob);
    sidebarItem("Gender", gender);
  }

  // ---------- MAIN SECTIONS ----------
  const sectionHeading = (label: string) => {
    ensureSpace(16);
    setFont(10, "bold");
    doc.setTextColor(...COLORS.ink);
    doc.text(label.toUpperCase(), MAIN_X, mainY);
    mainY += 2;
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.6);
    doc.line(MAIN_X, mainY, MAIN_X + 18, mainY);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.25);
    doc.line(MAIN_X + 18, mainY, MAIN_X + MAIN_W, mainY);
    mainY += 7;
  };

  const kvRow = (label: string, value: string) => {
    const labelW = 42;
    const valueLines = doc.splitTextToSize(value, MAIN_W - labelW);
    ensureSpace(5 + valueLines.length * 4.2);
    setFont(9, "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(label, MAIN_X, mainY);
    doc.setTextColor(...COLORS.ink);
    doc.text(valueLines, MAIN_X + labelW, mainY);
    mainY += Math.max(5.5, valueLines.length * 4.2);
  };

  // Professional summary
  sectionHeading("Professional profile");
  const summaryParts = [
    designation !== "—" ? designation : "Professional",
    department !== "—" ? `in ${department}` : null,
    orgName !== "—" ? `at ${orgName}` : null,
  ].filter(Boolean);
  const tenureBit =
    tenure !== "—" ? ` with ${tenure} of service` : joined !== "—" ? `, joined ${joined}` : "";
  const summary = `${fullName} is a ${summaryParts.join(" ")}${tenureBit}. Employment type: ${employmentType}.`;
  const summaryLines = doc.splitTextToSize(summary, MAIN_W);
  ensureSpace(summaryLines.length * 4.5 + 4);
  setFont(9.5, "normal");
  doc.setTextColor(...COLORS.ink);
  doc.text(summaryLines, MAIN_X, mainY);
  mainY += summaryLines.length * 4.5 + 6;

  // Employment
  sectionHeading("Employment");
  kvRow("Organization", orgName);
  kvRow("Designation", designation);
  kvRow("Department", department);
  kvRow("Employment type", employmentType);
  kvRow("Date of joining", joined);
  kvRow("Tenure", tenure);
  kvRow("Office location", office);
  mainY += 3;

  // Reporting & insights
  sectionHeading("Reporting & insights");
  kvRow("Reports to", manager);
  kvRow("Attendance rate", attendanceLabel);
  mainY += 4;

  // Closing note
  ensureSpace(16);
  setFont(8, "normal");
  doc.setTextColor(...COLORS.soft);
  const note = "This document is generated from the employee profile for professional use.";
  doc.text(doc.splitTextToSize(note, MAIN_W), MAIN_X, mainY);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setFont(7.5, "normal");
    doc.setTextColor(...COLORS.soft);
    doc.text(
      `${fullName}  ·  ${orgName}`,
      MARGIN,
      pageH - 8
    );
    doc.text(
      `Generated ${moment().format("D MMM YYYY")}  ·  Page ${i} of ${pageCount}`,
      pageW - MARGIN,
      pageH - 8,
      { align: "right" }
    );
  }

  const safeFirst = (firstName || "Employee").replace(/[^\w\-]+/g, "_");
  const safeLast = (lastName || "Profile").replace(/[^\w\-]+/g, "_");
  doc.save(`${safeFirst}_${safeLast}_CV.pdf`);
};
