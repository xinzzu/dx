export type Badge = {
  id: string;
  title: string;
  desc: string;
  icon: string; // path PNG/SVG di /public
};

export const ALL_BADGES: Badge[] = [
  {
    id: "pahlawan-hemat-listrik",
    title: "Pahlawan Hemat Listrik",
    desc: "Berhasil mengurangi konsumsi listrik 20% dalam sebulan",
    icon: "/images/badges/hemat-listrik.png",
  },
  {
    id: "jalur-hijau",
    title: "Jalur Hijau",
    desc: "Menggunakan transportasi umum sebanyak 10 kali",
    icon: "/images/badges/jalur-hijau.png",
  },
  {
    id: "ksatria-energi",
    title: "Ksatria Energi",
    desc: "5 Hari cabut steker tanpa terlewat satu hari pun",
    icon: "/images/badges/ksatria-energi.png",
  },
  {
    id: "pejuang-anti-polusi",
    title: "Pejuang Anti Polusi",
    desc: "Menggunakan sepeda dalam aktivitas selama 5 hari",
    icon: "/images/badges/anti-polusi.png",
  },
  {
    id: "pejuang-anti-plastik",
    title: "Pejuang Anti Plastik",
    desc: "Menggunakan tas belanja sendiri sebanyak 5 kali",
    icon: "/images/badges/anti-plastik.png",
  },
  {
    id: "pemilah-sampah",
    title: "Pemilah Sampah",
    desc: "Berhasil memilah sampah dalam satu bulan",
    icon: "/images/badges/pemilah-sampah.png",
  },
];

// contoh lencana yang dimiliki user (mock; nanti bisa diganti dari store/API)
export const OWNED_BADGE_IDS: string[] = [
  "pahlawan-hemat-listrik",
  "jalur-hijau",
];
