"use client";

import Link from "next/link";
import Image from "next/image";
import LeaderboardItem from "@/components/shared/tantangan/LeaderboardItem";
import { useCallback, useEffect, useState } from "react";
import { authService } from "@/services/auth";
import useAuth from "@/hooks/useAuth";

const allUsers = [
  { rank: 1, name: "Budi Siregar", avatar: "/images/tantangan/avatars/1.png", points: "5.000" },
  { rank: 2, name: "Taufan Ali", avatar: "/images/tantangan/avatars/2.png", points: "5.000" },
  { rank: 3, name: "Siti Aminah", avatar: "/images/tantangan/avatars/3.png", points: "5.000" },
  { rank: 4, name: "Andi Nugroho", avatar: "/images/tantangan/avatars/4.png", points: "5.000" },
  { rank: 5, name: "Petrik Kluwert", avatar: "/images/tantangan/avatars/2.png", points: "5.000" },
  { rank: 6, name: "Dina Kartika", avatar: "/images/tantangan/avatars/4.png", points: "4.800" },
  { rank: 7, name: "Eko Prasetyo", avatar: "/images/tantangan/avatars/1.png", points: "4.500" },
  { rank: 8, name: "Fifi Angel", avatar: "/images/tantangan/avatars/3.png", points: "4.200" },
  { rank: 9, name: "Gatot Subroto", avatar: "/images/tantangan/avatars/2.png", points: "4.000", active: true },

  { rank: 10, name: "Karina Aespa", avatar: "/images/tantangan/avatars/1.png", points: "450" },
  { rank: 11, name: "Hendri Irawan", avatar: "/images/tantangan/avatars/4.png", points: "350" },
  { rank: 12, name: "Irma Susanti", avatar: "/images/tantangan/avatars/2.png", points: "320" },
  { rank: 13, name: "Joko Widodo", avatar: "/images/tantangan/avatars/3.png", points: "300" },
  { rank: 14, name: "Lia Mariana", avatar: "/images/tantangan/avatars/1.png", points: "290" },
  { rank: 15, name: "Mega Putra", avatar: "/images/tantangan/avatars/4.png", points: "280" },
  { rank: 16, name: "Nina Zahra", avatar: "/images/tantangan/avatars/2.png", points: "270" },
  { rank: 17, name: "Oki Pratama", avatar: "/images/tantangan/avatars/3.png", points: "250" },
  { rank: 18, name: "Putri Kemuning", avatar: "/images/tantangan/avatars/1.png", points: "230" },
  { rank: 19, name: "Rizky Agung", avatar: "/images/tantangan/avatars/4.png", points: "210" },
  { rank: 20, name: "Sari Dewi", avatar: "/images/tantangan/avatars/2.png", points: "200" },

  { rank: 99, name: "Aziz Nurrahman", avatar: "/images/tantangan/avatars/3.png", points: "50" },
];

const PRIMARY_COLOR = "text-emerald-600";
const PRIMARY_BG = "bg-emerald-50";

const me = { rankLabel: "100++", points: 50 };

export default function PapanPeringkatPage() {
  const topThree = allUsers.slice(0, 3);
  const remainingUsers = allUsers.slice(3);
  const { currentUser, getIdToken } = useAuth();
  const [userName, setUserName] = useState("Pengguna");

  const getBackendToken = useCallback(async () => {
    let backendToken = authService.getToken();
    if (!backendToken && currentUser) {
      const firebaseIdToken = await getIdToken();
      if (firebaseIdToken) {
        backendToken = await authService.loginWithGoogle(firebaseIdToken);
        authService.saveToken(backendToken);
      }
    }
    return backendToken;
  }, [currentUser, getIdToken]);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getBackendToken();
        if (!token) return;

        const { userService } = await import("@/services/user");
        const userData = await userService.getMe(token);
        setUserName(userData?.individual_profile?.full_name || userData?.email || "Pengguna");
      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    }

    loadData();
  }, [getBackendToken]);

  return (
    <main className="mx-auto max-w-lg pb-40">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm px-4">
        <div className="flex items-center gap-2 py-3">
          <Link href="/app/tantangan" aria-label="Kembali" className="h-9 w-9 grid place-items-center">
            <Image src="/arrow-left.svg" alt="" width={18} height={18} />
          </Link>
          <h1 className="flex-1 text-center text-xl text-black">Papan Peringkat</h1>
          <div className="h-9 w-9" />
        </div>
        <div className="h-px w-full bg-gray-200" />
      </div>

      <div className="px-4 mt-30">
        <div className="mt-4 flex justify-around items-end h-40 gap-3">
          {topThree[1] && (
            <div className="flex flex-col items-center order-1 w-1/3">
              <div className="text-xl font-bold text-gray-500 mb-1">2</div>
              <Image src={topThree[1].avatar} alt={topThree[1].name} width={64} height={64} className="rounded-full border-4 border-gray-300" />
              <div className="mt-1 text-xs font-semibold text-gray-700 truncate w-full text-center">{topThree[1].name}</div>
              <div className="bg-gray-200 h-20 w-full rounded-t-lg mt-1" />
            </div>
          )}

          {topThree[0] && (
            <div className="flex flex-col items-center order-2 w-1/3">
              <div className="text-3xl font-extrabold text-yellow-500 mb-1">1</div>
              <Image src={topThree[0].avatar} alt={topThree[0].name} width={80} height={80} className="rounded-full border-4 border-yellow-500 shadow-lg" />
              <div className="mt-1 text-sm font-bold text-gray-800 truncate w-full text-center">{topThree[0].name}</div>
              <div className="bg-yellow-400 h-28 w-full rounded-t-lg mt-1" />
            </div>
          )}

          {topThree[2] && (
            <div className="flex flex-col items-center order-3 w-1/3">
              <div className="text-lg font-bold text-orange-400 mb-1">3</div>
              <Image src={topThree[2].avatar} alt={topThree[2].name} width={56} height={56} className="rounded-full border-4 border-orange-400" />
              <div className="mt-1 text-xs font-semibold text-gray-700 truncate w-full text-center">{topThree[2].name}</div>
              <div className="bg-orange-300 h-16 w-full rounded-t-lg mt-1" />
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-white border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {remainingUsers.map((u) => (
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
      </div>

      <div
        className="fixed bottom-0 z-30 bg-white border-t-2 border-emerald-600 
                   left-0 right-0 mx-auto max-w-md"
      >
        <div className={`px-4 py-3 ${PRIMARY_BG} rounded-t-xl`}>

          <div className="text-xs font-semibold text-emerald-800">Peringkat Anda:</div>

          <div className="mt-1 flex justify-between items-center">
            <div className="text-xl font-bold text-gray-900 truncate">
              {userName}
            </div>

            <div className="flex items-center space-x-6 text-right">
              <div className="w-16 flex-shrink-0">
                <div className="text-xs text-gray-600">Rank</div>
                <div className="text-lg font-extrabold text-emerald-600">{me.rankLabel}</div>
              </div>
              <div className="w-16 flex-shrink-0">
                <div className="text-xs text-gray-600">Poin</div>
                <div className="text-lg font-extrabold text-emerald-600">{me.points}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}