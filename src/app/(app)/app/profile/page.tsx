"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHeaderCard from "@/components/shared/profile/ProfileHeaderCard";
import SectionTitle from "@/components/shared/profile/SectionTitle";
import BadgeCard from "@/components/shared/profile/BadgeCard";
import SettingRow from "@/components/shared/profile/SettingRow";
import LogoutBar from "@/components/shared/profile/LogoutBar";
import { ALL_BADGES, OWNED_BADGE_IDS } from "@/data/badge";
import useAuth from "@/hooks/useAuth";
import { userService } from "@/services/user";
import { authService } from "@/services/auth";
import ScrollContainer from "@/components/nav/ScrollContainer";

interface ScrollAwareHeaderProps {
  title: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const { logout, getIdToken, currentUser: currentFirebaseUser } = useAuth();

  const BADGES_PATH = "/app/profile/lencana";
  const EDIT_PATH = "/app/profile/edit-profile";
  const SEC_PATH = "/app/profile/manajemen-bangunan";
  const TRITH_PATH = "/app/profile/manajemen-kendaraan";
  const FOURTH_PATH = "/terms";
  const FIVE_PATH = "/terms";
  const AFTER_LOGOUT_PATH = "/";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // preview 2 lencana, prioritaskan yang dimiliki
  const previewBadges = useMemo(() => {
    const sorted = [...ALL_BADGES].sort((a, b) => {
      const ao = OWNED_BADGE_IDS.includes(a.id) ? 0 : 1;
      const bo = OWNED_BADGE_IDS.includes(b.id) ? 0 : 1;
      return ao - bo;
    });
    return sorted.slice(0, 2);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let token = authService.getToken();
        if (!token) {
          // try exchange firebase id token
          if (currentFirebaseUser) {
            const firebaseIdToken = await currentFirebaseUser.getIdToken(true);
            token = await authService.loginWithGoogle(firebaseIdToken);
            authService.saveToken(token);
          }
        }

        if (!token) {
          setLoading(false);
          return;
        }

        const me = await userService.getMe(token);
        setUser(me);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to normalize created_at to 'DD MMM YYYY' (Indonesian)
  function formatJoined(createdAt?: string | null) {
    if (!createdAt) return "";
    // extract YYYY-MM-DD portion to avoid timezone/format issues
    const m = String(createdAt).match(/\d{4}-\d{2}-\d{2}/);
    if (!m) return "";
    const date = new Date(m[0]);
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return m[0];
    }
  }

  function onLogout() {
    logout().finally(() => router.replace(AFTER_LOGOUT_PATH));
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll ke bawah
        setIsVisible(false);
      } else {
        // Scroll ke atas
        setIsVisible(true);
        console.log("scroll up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <ScrollContainer
      headerTitle="Profil"
      showBottomLine={true}
    >
      <div className="min-h-dvh bg-white text-black">
        <div className="mx-auto max-w-lg pb-[88px]">
          <div>
            <ProfileHeaderCard
              name={
                user?.name || user?.individual_profile?.full_name || user?.email || "-"
              }
              email={user?.email || "-"}
              joinedText={formatJoined(user?.created_at || user?.joined)}
              level={user?.level || 0}
              totalPoints={user?.points || 0}
              rank={user?.rank || ""}
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
            <div className="mt-2 divide-y divide-black/10">
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
      </div>
    </ScrollContainer>

  );
}
