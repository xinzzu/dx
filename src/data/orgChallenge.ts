export type OrgChallenge = {
  id: string;
  title: string;
  description: string;
  period: "weekly" | "monthly";
  icon: string;          // path icon
  target: number;        // target angka (mis 3 perjalanan / 20%)
  unit: string;          // label target (kali / % / kWh)
  progress: number;      // current progress
  points: number;        // reward when completed
  completed?: boolean;
};

export type OrgLeaderboardItem = {
  id: string;
  name: string;          // nama unit/pegawai
  scoreLabel: string;    // e.g. "12 kg CO₂e"
  rank: number;
  highlight?: boolean;   // tandai jika milik user/organisasi sendiri
};

export const ORG_CHALLENGES: OrgChallenge[] = [
  {
    id: "transport-umum-mingguan",
    title: "Transport Umum untuk Perjalanan Dinas (Mingguan)",
    description: "Gunakan transportasi umum untuk perjalanan dinas minimal 3 kali minggu ini.",
    period: "weekly",
    icon: "/images/challenges/bus.png",
    target: 3,
    unit: "kali",
    progress: 1,
    points: 100,
  },
  {
    id: "hemat-listrik-bulanan",
    title: "Hemat Listrik Kantor (Bulanan)",
    description: "Turunkan konsumsi listrik kantor 10% bulan ini.",
    period: "monthly",
    icon: "/images/challenges/power.png",
    target: 10,
    unit: "%",
    progress: 10,
    points: 150,
    completed: true,
  },
];

export const ORG_LEADERBOARD: OrgLeaderboardItem[] = [
  { id: "u1", name: "Divisi Operasional", scoreLabel: "12 kg CO₂e", rank: 1 },
  { id: "u2", name: "Kamu (Lembaga)", scoreLabel: "15 kg CO₂e", rank: 2, highlight: true },
  { id: "u3", name: "Divisi Keuangan", scoreLabel: "17 kg CO₂e", rank: 3 },
  { id: "u4", name: "Divisi HR",        scoreLabel: "20 kg CO₂e", rank: 4 },
];
