"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import ScrollContainer from "@/components/nav/ScrollContainer";

// ==== Ganti path svg ini sesuai punyamu ====
const ICONS = {
  name:  "/icons/profile/ic-user.svg",
  email: "/icons/profile/ic-mail.svg",
  phone: "/icons/profile/ic-phone.svg",
};

function FieldLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-black">
      <Image src={icon} alt="" width={16} height={16} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();

  // dummy state (belum ke API)
  const [name, setName]   = React.useState("Jhon Doe");
  const [email, setEmail] = React.useState("johndoe@mail.com");
  const [phone, setPhone] = React.useState("+6281234567890");

  const [avatarUrl, setAvatarUrl] = React.useState<string>("/images/user.png");
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  function handlePickAvatar() {
    fileRef.current?.click();
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrasi API: { name, email, phone, avatar: fileRef.current?.files?.[0] }
    router.back();
  }

  return (
    <ScrollContainer
                headerTitle="Edit Profil"
                leftContainer={
                  <button
                    onClick={() => router.back()}
                    aria-label="Kembali"
                    className="h-9 w-9 grid place-items-center"
                  >
                    <Image src="/arrow-left.svg" alt="" width={18} height={18} />
                  </button>
                }
              >

      {/* Body */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handlePickAvatar}
            className="relative h-28 w-28 overflow-hidden rounded-full ring-1 ring-black/10"
            aria-label="Ubah foto profil"
          >
            <Image
              src={avatarUrl}
              alt="Foto profil"
              fill
              sizes="112px"
              style={{ objectFit: "cover" }}
            />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <div className="mt-2 text-sm text-black/50">Ubah foto profil</div>
        </div>

        {/* Fields dengan label + icon */}
        <div className="space-y-4 rounded-2xl border border-black/10 p-4">
          <div>
            <FieldLabel icon={ICONS.name}>Nama Lengkap</FieldLabel>
            <TextField
              id="fullName"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <FieldLabel icon={ICONS.email}>Email</FieldLabel>
            <TextField
              id="email"
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <FieldLabel icon={ICONS.phone}>Nomor Telepon</FieldLabel>
            <TextField
              id="phone"
              placeholder="+62xxxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </ScrollContainer>
  );
}
