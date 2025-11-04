// src/app/(lembaga)/lembaga/profile/page.tsx
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ✅ Use shared components (same as individu)
import ProfileHeaderCard from "@/components/shared/profile/ProfileHeaderCard";
import SectionTitle from "@/components/shared/profile/SectionTitle";
import BadgeCard from "@/components/shared/profile/BadgeCard";
import SettingRow from "@/components/shared/profile/SettingRow";
import LogoutBar from "@/components/shared/profile/LogoutBar";

import { ALL_BADGES, OWNED_BADGE_IDS } from "@/data/badge";

export default function OrgProfilePage() {
  const router = useRouter();

  const org = {
    name: "Nama Lembaga",
    email: "emailpic@mail.com",
    joined: "Bergabung Okt 2025",
  };

  function onLogout() {
    router.push("/");
  }

  // --- preview 2 lencana (prioritaskan yang owned)
  const sorted = [...ALL_BADGES].sort((a, b) => {
    const ao = OWNED_BADGE_IDS.includes(a.id) ? 0 : 1;
    const bo = OWNED_BADGE_IDS.includes(b.id) ? 0 : 1;
    return ao - bo;
  });
  const previewBadges = sorted.slice(0, 2);

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

        <div className="mt-4">
          <ProfileHeaderCard
            name={org.name}
            email={org.email}
            joinedText={org.joined}
            level={2}
            totalPoints={50}
            rank="#1250"
          />
        </div>

        {/* === Koleksi Lencana (preview) === */}
        <div className="mt-5">
          <SectionTitle
            action={
              <button
                className="text-sm text-[color:var(--color-primary)]"
                onClick={() => router.push("/lembaga/profile/lencana")}
              >
                Lihat Semua
              </button>
            }
          >
            <div className="flex items-center gap-2">
              <Image src="/images/profile/badge-power.png" alt="" width={30} height={30} />
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

        {/* Pengaturan */}
        <div className="mt-6">
          <SectionTitle>Pengaturan Akun & Lainnya</SectionTitle>
          <div className="mt-2 divide-y">
            <SettingRow
              icon="/icons/lembaga/profile/ic-edit.svg"
              title="Edit Profil"
              subtitle="Ubah info personal"
              href="/lembaga/profile/edit"
            />
            <SettingRow
              icon="/icons/lembaga/profile/ic-building.svg"
              title="Manajemen Bangunan"
              subtitle="Daftar aset bangunan Anda"
              href="/lembaga/profile/manajemen-bangunan"
            />
            <SettingRow
              icon="/icons/lembaga/profile/ic-vehicle.svg"
              title="Manajemen Kendaraan"
              subtitle="Daftar aset kendaraan Anda"
              href="/lembaga/profile/manajemen-kendaraan"
            />
            <SettingRow
              icon="/icons/lembaga/profile/ic-help.svg"
              title="Bantuan & Saran"
              subtitle="Pusat bantuan dan masukan"
              href="/lembaga/profile/bantuan"
            />
            <SettingRow
              icon="/icons/lembaga/profile/ic-terms.svg"
              title="Syarat & Ketentuan"
              subtitle="Kebijakan privasi"
              href="/lembaga/profile/terms"
            />
          </div>
        </div>

        <LogoutBar onClick={onLogout} />
        <p className="mt-4 text-center text-xs text-black/50">
          1000CahayaMu App v1.0.0
        </p>
      </div>
    </main>
  );
}
