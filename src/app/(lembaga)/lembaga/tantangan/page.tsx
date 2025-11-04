"use client";
import SectionHeader from "@/components/shared/tantangan/SectionHeader";
import ChallengeCard from "@/components/shared/tantangan/ChallengeCard";
import LeaderboardItem from "@/components/shared/tantangan/LeaderboardItem";

// ---- dummy data (nanti ganti dari API)
const weeklyChallenge = {
  icon: "/images/tantangan/badge-transport.png",
  title: "Tantangan Transportasi Umum Mingguan",
  desc:
    "Gunakan transportasi umum minimal 3 kali minggu ini untuk mengurangi emisi kendaraan pribadi",
  progress: 1 / 3,
  progressLabel: "1/3 perjalanan selesai!",
};

const dailyMission = {
  icon: "/images/tantangan/unplug.png",
  title: "Misi Harian: Cabut Steker Elektronik",
  desc:
    "Cabut semua steker elektronik yang tidak digunakan sebelum tidur.",
  completedLabel: "Tantangan Selesai, +50 points",
};

const leaderboard = [
  {
    rank: 1,
    name: "Budi Siregar",
    avatar: "/images/tantangan/avatars/1.png",
    valueText: "Jejak karbon: 12 kg CO₂e",
  },
  {
    rank: 2,
    name: "Lembaga Kamu",
    avatar: "/images/tantangan/avatars/2.png",
    valueText: "Jejak karbon: 15 kg CO₂e",
    active: true,
  },
  {
    rank: 3,
    name: "Siti Aminah",
    avatar: "/images/tantangan/avatars/3.png",
    valueText: "Jejak karbon: 17 kg CO₂e",
  },
  {
    rank: 4,
    name: "Andi Nugroho",
    avatar: "/images/tantangan/avatars/4.png",
    valueText: "Jejak karbon: 20 kg CO₂e",
  },
];

export default function TantanganPageLembaga() {
  return (
    <main className="mx-auto max-w-lg px-4 pt-2 pb-[88px]">
      {/* Headline */}
      <div className="text-center pt-2">
        <h1 className="text-xl font-semibold">Tantangan & Misi</h1>
        <p className="text-sm text-black/60">Aksi seru, buktikan komitmen Anda</p>
      </div>

      {/* Divider primary */}
      <div
        className="mt-3 h-[2px] w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* Tantangan Pilihan */}
      <div className="mt-4">
        <SectionHeader
          icon="/images/tantangan/public-transport.png"
          title="Tantangan Pilihan"
        />

        <div className="mt-4 space-y-4">
          <ChallengeCard
            icon={weeklyChallenge.icon}
            title={weeklyChallenge.title}
            desc={weeklyChallenge.desc}
            progress={weeklyChallenge.progress}
            progressLabel={weeklyChallenge.progressLabel}
            ctaText="Selesaikan Misi"
            onCta={() => console.log("Selesaikan Misi")}
          />

          <ChallengeCard
            icon={dailyMission.icon}
            title={dailyMission.title}
            desc={dailyMission.desc}
            progress={1}
            progressLabel={dailyMission.completedLabel}
            shareable
            onCta={() => {}}
          />
        </div>
      </div>

      {/* Papan Peringkat Mingguan */}
      <div className="mt-6">
        <SectionHeader
          icon="/images/tantangan/trophy.png"
          title="Papan Peringkat Mingguan"
        />
        <div className="mt-2 space-y-2">
          {leaderboard.map((u) => (
            <LeaderboardItem
              key={u.rank}
              rank={u.rank}
              name={u.name}
              avatar={u.avatar}
              valueText={u.valueText}
              active={u.active}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
