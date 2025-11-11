"use client";

import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/shared/tantangan/SectionHeader";
import ChallengeCard from "@/components/shared/tantangan/ChallengeCard";
import LeaderboardItem from "@/components/shared/tantangan/LeaderboardItem";
import { Scroll } from "lucide-react";
import ScrollContainer from "@/components/nav/ScrollContainer";

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
  desc: "Cabut semua steker elektronik yang tidak digunakan sebelum tidur.",
  completedLabel: "Tantangan Selesai, +50 points",
};

const leaderboard = [
  // minimal 12 agar kelihatan slice(0,10)
  { rank: 1, name: "Budi Siregar", avatar: "/images/tantangan/avatars/1.png", points: "5.000" },
  { rank: 2, name: "Taufan Ali", avatar: "/images/tantangan/avatars/2.png", points: "5.000" },
  { rank: 3, name: "Siti Aminah", avatar: "/images/tantangan/avatars/3.png", points: "5.000" },
  { rank: 4, name: "Andi Nugroho", avatar: "/images/tantangan/avatars/4.png", points: "5.000" },
  { rank: 5, name: "Petrik Kluwert", avatar: "/images/tantangan/avatars/2.png", points: "5.000" },
  { rank: 6, name: "Karina Aespa", avatar: "/images/tantangan/avatars/1.png", points: "450" },
  { rank: 7, name: "Rina", avatar: "/images/tantangan/avatars/3.png", points: "300" },
  { rank: 8, name: "Anton", avatar: "/images/tantangan/avatars/4.png", points: "250" },
  { rank: 9, name: "Bambang", avatar: "/images/tantangan/avatars/3.png", points: "120" },
  { rank: 10, name: "Cici", avatar: "/images/tantangan/avatars/1.png", points: "100" },
  { rank: 11, name: "Aziz Nurrahman", avatar: "/images/tantangan/avatars/2.png", points: "50", active: true },
  { rank: 99, name: "Jhon Doe", avatar: "/images/tantangan/avatars/1.png", points: "50" },
];

export default function TantanganPage() {
  return (
    <ScrollContainer
      headerTitle="Tantangan"
      showBottomLine={true}
    >
      <div className="min-h-dvh bg-white text-black">
        <div className="mx-auto max-w-lg pb-[88px]">
          {/* Tantangan Pilihan */}
          <section>
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
                onCta={() => { }}
              />
            </div>
          </section>

          {/* Papan Peringkat (Top 10) */}
          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/images/tantangan/trophy.png" alt="" width={20} height={20} />
                <h2 className="text-base font-semibold">Papan Peringkat</h2>
              </div>
              <Link
                href="/app/tantangan/papan-peringkat"
                className="rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200"
              >
                Lihat Semua
              </Link>
            </div>

            {/* Card putih + divider seperti desain */}
            <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-200/70 overflow-hiddenmt-4">
              {leaderboard.slice(0, 5).map((u) => (
                <LeaderboardItem
                  key={u.rank}
                  rank={u.rank}
                  name={u.name}
                  avatar={u.avatar}
                  points={u.points}
                  active={u.active}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </ScrollContainer>
  );
}
