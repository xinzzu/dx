import { TransportEntry, VehicleType } from "./types";

const KEY = "catat.transportasi";

// Definisikan tipe data yang kita harapkan.
// Partial<> berarti tidak semua jenis kendaraan harus ada di dalam data.
type StoredTransportData = Partial<Record<VehicleType, TransportEntry>>;

export function loadTransport(): StoredTransportData {
  // Jika kode berjalan di server (SSR), window tidak ada.
  // Kembalikan objek kosong.
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(KEY);
    // Jika tidak ada data di localStorage, kembalikan objek kosong.
    if (!raw) {
      return {};
    }
    // Parse data dan beritahu TypeScript untuk memperlakukannya sebagai tipe kita.
    return JSON.parse(raw) as StoredTransportData;
  } catch (error) {
    // Jika terjadi error saat parsing, catat error dan kembalikan objek kosong.
    console.error("Gagal memuat atau parse data transportasi:", error);
    return {};
  }
}

export function saveTransport(entry: TransportEntry) {
  const all = loadTransport();
  all[entry.type] = entry;
  
  // Pastikan localStorage hanya diakses di sisi client.
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(all));
  }
}

export function clearTransport() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}