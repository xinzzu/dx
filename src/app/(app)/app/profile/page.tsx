"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProfileHeaderCard from "@/components/shared/profile/ProfileHeaderCard";
import SectionTitle from "@/components/shared/profile/SectionTitle";
import BadgeCard from "@/components/shared/profile/BadgeCard";
import SettingRow from "@/components/shared/profile/SettingRow";
import LogoutBar from "@/components/shared/profile/LogoutBar";
import { ALL_BADGES, OWNED_BADGE_IDS } from "@/data/badge";

export default function ProfilPage() {
  const router = useRouter();

  const BADGES_PATH = "/app/profile/lencana";
  const EDIT_PATH = "/app/profile/edit";
  const SEC_PATH = "/app/profile/manajemen-bangunan";
  const TRITH_PATH = "/app/profile/manajemen-kendaraan";
  const FOURTH_PATH = "/terms";
  const FIVE_PATH = "/terms";
  const AFTER_LOGOUT_PATH = "/";

  // mock user
  const user = {
    name: "John Doe",
    email: "johndoe@mail.com",
    joined: "Bergabung Okt 2025",
    level: 2,
    points: 50,
    rank: "#1240",
  };

  // preview 2 lencana, prioritaskan yang dimiliki
  const previewBadges = useMemo(() => {
    const sorted = [...ALL_BADGES].sort((a, b) => {
      const ao = OWNED_BADGE_IDS.includes(a.id) ? 0 : 1;
      const bo = OWNED_BADGE_IDS.includes(b.id) ? 0 : 1;
      return ao - bo;
    });
    return sorted.slice(0, 2);
  }, []);

  function onLogout() {
    // TODO: clear token, storage, dll
    router.replace(AFTER_LOGOUT_PATH);
  }

  return (
    <main className="min-h-dvh bg-white text-black">
      <div className="mx-auto max-w-lg px-4 pb-[88px] pt-4">
        <header className="text-center">
          <h1 className="text-2xl font-semibold">Profil</h1>
        </header>
        <div
          className="mt-3 h-[2px] w-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        {/* HEADER */}
        <div className="mt-4">
          <ProfileHeaderCard
            name={user.name}
            email={user.email}
            joinedText={user.joined}
            level={user.level}
            totalPoints={user.points}
            rank={user.rank}
          />
        </div>

        {/* KOLEKSI LENCANA */}
        <div className="mt-5">
          <SectionTitle
            action={
              <button
                className="text-sm text-[color:var(--color-primary)]"
                onClick={() => router.push(BADGES_PATH)}
              >
                Lihat Semua
              </button>
            }
          >
            <div className="flex items-center gap-2">
              <Image
                src="/images/profile/badge-power.png"
                alt=""
                width={30}
                height={30}
              />
              Koleksi Lencana
            </div>
          </SectionTitle>

          <p className="mt-3 text-sm text-black/70">
            Kumpulan lencana adalah bukti nyata komitmenmu.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {previewBadges.map((b) => (
              <BadgeCard
                key={b.id}
                iconSrc={b.icon}
                title={b.title}
                desc={b.desc}
                owned={OWNED_BADGE_IDS.includes(b.id)}
              />
            ))}
          </div>
        </div>

        {/* PENGATURAN */}
        <div className="mt-6">
          <SectionTitle>Pengaturan Akun & Lainnya</SectionTitle>
          <div className="mt-2 divide-y">
            <SettingRow
              icon="/icons/app/profile/ic-edit.svg"
              title="Edit Profil"
              subtitle="Ubah info personal"
              href={EDIT_PATH}
            />
            <SettingRow
              icon="/icons/app/profile/ic-building.svg"
              title="Manajemen Bangunan"
              subtitle="Daftar aset bangunan Anda"
              href={SEC_PATH}
            />
            <SettingRow
              icon="/icons/app/profile/ic-vehicle.svg"
              title="Manajemen Kendaraan"
              subtitle="Daftar aset kendaraan Anda"
              href={TRITH_PATH}
            />
            <SettingRow
              icon="/icons/app/profile/ic-help.svg"
              title="Bantuan & Saran"
              subtitle="Pusat bantuan dan masukan"
              href={FOURTH_PATH}
            />
            <SettingRow
              icon="/icons/app/profile/ic-terms.svg"
              title="Syarat & Ketentuan"
              subtitle="Kebijakan privasi"
              href={FIVE_PATH}
            />
          </div>
        </div>

        {/* LOGOUT */}
        <LogoutBar onClick={onLogout} />

        <p className="mt-3 text-center text-xs text-black/50">
          1000CahayaMu App v1.0.0
        </p>
      </div>
    </main>
  );
}
