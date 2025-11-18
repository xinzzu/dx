// Helper to create user-friendly error messages from unknown errors.
// Keeps full error logged to console for debugging, but returns a short
// human-readable message suitable for toasts/UI.
export function userFriendlyError(err: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  // Keep raw error in console for devs/QA
  try {
    console.error("Raw error for userFriendlyError:", err);
  } catch {}

  const toLower = (s?: string) => (s || "").toLowerCase();

  // If it's an Error instance, inspect the message
  if (err instanceof Error) {
    const m = toLower(err.message);

    // Detect backend message like: "report type for November 2025 is already set to monthly"
    const reportTypeMatch = m.match(/report type for\s+([a-z]+\s+\d{4})\s+is already set to\s+(monthly|weekly)/i);
    if (reportTypeMatch) {
      const month = reportTypeMatch[1].trim();
      const type = reportTypeMatch[2].toLowerCase();
      const humanType = type === "monthly" ? "bulanan" : "mingguan";
      return `Laporan untuk ${month} sudah diset sebagai ${humanType}.`;
    }

    // ✅ New: detect "maximum monthly reports reached for <Month Year>"
    const monthlyMatch = m.match(/maximum monthly reports reached for\s+([a-z0-9\s]+[0-9]{4})/i);
    if (monthlyMatch) {
      const month = monthlyMatch[1].trim();
      return `Batas laporan bulanan telah tercapai untuk ${month}.`;
    }

    if (m.includes("unauthorized") || m.includes("401") || m.includes("token")) {
      return "Akses ditolak. Silakan login ulang.";
    }

    if (m.includes("not found") || m.includes("404") || m.includes("tidak ditemukan")) {
      return "Data tidak ditemukan.";
    }

    if (m.includes("maximum weekly") || m.includes("weekly reports") || (m.includes("maksimum") && m.includes("mingguan")) || (m.includes("batas") && m.includes("mingguan"))) {
      return "Batas laporan mingguan telah tercapai.";
    }

    if (m.includes("bad request") || m.includes("400") || m.includes("invalid") || m.includes("validation")) {
      return "Data input tidak valid. Periksa kembali isian Anda.";
    }

    // Fallback to a generic message rather than exposing detailed error
    return fallback;
  }

  // If it's a stringifiable object, try to detect keywords there as well
  try {
    const s = JSON.stringify(err).toLowerCase();

    // Detect same pattern inside stringified payloads
    const reportTypeMatch2 = s.match(/report type for\s+([a-z]+\s+\d{4})\s+is already set to\s+(monthly|weekly)/i);
    if (reportTypeMatch2) {
      const month = reportTypeMatch2[1].trim();
      const type = reportTypeMatch2[2].toLowerCase();
      const humanType = type === "monthly" ? "bulanan" : "mingguan";
      return `Laporan untuk ${month} sudah diset sebagai ${humanType}.`;
    }

    // ✅ New: detect in stringified payload
    const monthlyMatch2 = s.match(/maximum monthly reports reached for\s+([a-z0-9\s]+[0-9]{4})/i);
    if (monthlyMatch2) {
      const month = monthlyMatch2[1].trim();
      return `Batas laporan bulanan telah tercapai untuk ${month}.`;
    }

    if (s.includes("maximum weekly") || s.includes("weekly reports") || s.includes("mingguan")) return "Batas laporan mingguan telah tercapai.";
    if (s.includes("bad request") || s.includes("400") || s.includes("invalid")) return "Data input tidak valid. Periksa kembali isian Anda.";
    if (s.includes("unauthorized") || s.includes("401") || s.includes("token")) return "Akses ditolak. Silakan login ulang.";
  } catch {}

  return fallback;
}
