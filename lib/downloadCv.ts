import jsPDF from "jspdf";
import moment from "moment";

export const handleDownloadCV = (user: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -------------------------
    // THEME & LAYOUT CONSTANTS
    // -------------------------
    const MARGIN_X = 20;
    let cursorY = 20;

    const COLORS = {
        primary: [79, 70, 229], // Indigo-600
        text: [0, 0, 0],
        muted: [150, 150, 150],
        white: [255, 255, 255],
        divider: [220, 220, 220],
    };

    // -------------------------
    // HELPERS
    // -------------------------
    const setFont = (size = 10, style: "normal" | "bold" = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
    };

    const sectionTitle = (title: string) => {
        cursorY += 12;
        setFont(14, "bold");
        doc.setTextColor(...COLORS.text);
        doc.text(title, MARGIN_X, cursorY);
        cursorY += 6;
    };

    const row = (label: string, value: string) => {
        setFont(10);
        doc.text(`${label}: ${value}`, MARGIN_X, cursorY);
        cursorY += 5;
    };

    const formatDate = (date?: string) =>
        date ? moment(date).format("LL") : "N/A";

    // -------------------------
    // HEADER
    // -------------------------
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 44, "F");

    doc.setTextColor(...COLORS.white);

    // Organization
    setFont(22, "bold");
    doc.text(
        (user.organization?.name || "ORGANIZATION").toUpperCase(),
        MARGIN_X,
        22
    );

    // Name
    setFont(12, "bold");
    doc.text(
        `${user.first_name} ${user.last_name}`.toUpperCase(),
        MARGIN_X,
        30
    );

    // Designation + Department
    setFont(11, "normal");
    doc.text(
        `${user.designation || "Employee"} • ${user.department || "General"}`,
        MARGIN_X,
        37
    );

    cursorY = 56;

    // Divider
    doc.setDrawColor(...COLORS.divider);
    doc.line(MARGIN_X, cursorY, pageWidth - MARGIN_X, cursorY);

    // -------------------------
    // CONTACT DETAILS
    // -------------------------
    sectionTitle("Contact Details");
    row("Email", user.email || "N/A");
    row("Phone", user.phoneNumber || "N/A");
    row(
        "Office",
        user.officeLocation?.name || user.office_location || "N/A"
    );

    // -------------------------
    // EMPLOYMENT SUMMARY
    // -------------------------
    sectionTitle("Employment Summary");

    row("Employee ID", user.employeeId || user.id || "N/A");
    row(
        "Joined On",
        formatDate(user.dateOfJoining || user.date_of_joining)
    );
    row("Tenure", user.tenure_display || "N/A");
    row(
        "Employment Type",
        user.employment_type
            ? user.employment_type.replace("_", " ").toUpperCase()
            : "FULL TIME"
    );

    // -------------------------
    // WORK INSIGHTS
    // -------------------------
    sectionTitle("Work Insights");

    row("Attendance Rate", `${user.attendance_rate || 0}%`);
    row(
        "Manager",
        user.manager?.firstName
            ? `${user.manager.firstName} ${user.manager.lastName}`
            : user.manager || "N/A"
    );

    // -------------------------
    // PERSONAL INFORMATION
    // -------------------------
    if (user.dateOfBirth || user.gender) {
        sectionTitle("Personal Information");
        row("Date of Birth", formatDate(user.dateOfBirth));
        row("Gender", user.gender || "N/A");
    }

    // -------------------------
    // FOOTER
    // -------------------------
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
        `Generated via Employee Self Service Portal • ${moment().format("LLL")}`,
        MARGIN_X,
        285
    );

    // -------------------------
    // SAVE
    // -------------------------
    doc.save(`${user.first_name}_${user.last_name}_CV.pdf`);
};