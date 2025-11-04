# 1000 Cahaya

Selamat datang di repositori **1000 Cahaya**. Ini adalah proyek [Next.js](https://nextjs.org) yang dirancang sebagai **Progressive Web App (PWA)** untuk pelacakan dan analisis jejak karbon, baik untuk pengguna individu maupun lembaga.

## Fitur Utama

Proyek ini dibagi menjadi dua alur pengguna utama: Individu dan Lembaga, serta halaman publik/marketing.

### 1. Alur Pengguna Individu (`/app`)
* **Dashboard Utama**: Halaman rangkuman aktivitas pengguna.
* **Pencatatan Emisi (`/catat`)**: Modul untuk mencatat aktivitas harian yang menghasilkan emisi.
    * Pencatatan Energi.
    * Pencatatan Transportasi.
* **Analisis (`/analisis`)**: Visualisasi data emisi pengguna menggunakan grafik (Donut chart, Trend chart).
* **Tantangan (`/tantangan`)**: Fitur gamifikasi yang mencakup *leaderboard* dan kartu tantangan.
* **Profil Pengguna (`/profile`)**: Pengaturan akun, lencana (badges), dan opsi keluar.

### 2. Alur Pengguna Lembaga (`/lembaga`)
* **Dashboard Lembaga**: Halaman utama untuk manajemen aset dan laporan.
* **Registrasi Aset**: Fitur untuk mendaftarkan aset lembaga seperti gedung dan kendaraan.
* **Analisis Lembaga (`/analisis`)**: Visualisasi data gabungan dari aset terdaftar.
* **Riwayat Laporan (`/riwayat`)**: Kumpulan laporan emisi periodik.
* **Profil Lembaga (`/profile`)**: Pengaturan akun lembaga.

### 3. Alur Publik & Otentikasi (`/`)
* **Landing Page**: Halaman depan publik.
* **Otentikasi (`/auth`)**: Login dan Register.
* **Onboarding**: Alur perkenalan saat pengguna pertama kali mendaftar.
* **Survei Awal (`/survey`)**: Kuesioner untuk mengumpulkan data awal pengguna terkait:
    * Energi Listrik
    * Limbah & Sampah
    * Transportasi

### 4. Progressive Web App (PWA)
* **Installable**: Aplikasi ini dapat diinstal di perangkat seluler atau desktop berkat konfigurasi `next-pwa` dan `manifest.json`.
* **Offline Support**: Dikonfigurasi untuk bekerja secara offline menggunakan service worker (`sw.js`).

---

## Teknologi yang Digunakan

* **Framework**: [Next.js](https://nextjs.org/) 15.5.4 (dengan App Router)
* **Bundler**: [Turbopack](https://turbo.build/pack) (digunakan dalam skrip `dev` dan `build`)
* **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
* **UI Library**: [React](https://reactjs.org/) 19.1.0
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
* **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)
* **Visualisasi Data**: [Recharts](https://recharts.org/)
* **Linting**: [ESLint](https://eslint.org/)
* **Utilities**: `tailwind-merge`

---

## Arsitektur Proyek
```bash
Proyek ini menggunakan **Next.js App Router** yang ditempatkan di dalam direktori `src`. Arsitektur utama dibagi berdasarkan fitur dan alur pengguna menggunakan *Route Groups*.
src
├── app/
│   ├── (app)/                    # Grup Rute untuk Pengguna Individu (setelah login)
│   │   ├── app/
│   │   │   ├── analisis/
│   │   │   ├── catat/
│   │   │   ├── profile/
│   │   │   ├── tantangan/
│   │   │   └── page.tsx          # Dashboard Individu
│   │   └── layout.tsx            # Layout utama individu (termasuk BottomNav)
│   │
│   ├── (lembaga)/                # Grup Rute untuk Pengguna Lembaga (setelah login)
│   │   ├── lembaga/
│   │   │   ├── analisis/
│   │   │   ├── profile/
│   │   │   ├── riwayat/
│   │   │   └── page.tsx          # Dashboard Lembaga
│   │   └── layout.tsx            # Layout utama lembaga (termasuk BottomNav Lembaga)
│   │
│   ├── (marketing)/              # Grup Rute untuk Halaman Publik & Otentikasi
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── complete-profile/
│   │   ├── onboarding/
│   │   ├── register-aset/
│   │   ├── survey/
│   │   └── page.tsx              # Landing Page Publik
│   │
│   ├── activate/                 # Halaman aktivasi akun (di luar grup)
│   ├── offline/                  # Halaman fallback PWA
│   ├── globals.css               # Styles global
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── auth/                     # Komponen terkait otentikasi
│   ├── individu/                 # Komponen spesifik untuk alur Individu
│   ├── lembaga/                  # Komponen spesifik untuk alur Lembaga
│   ├── nav/                      # Komponen navigasi (BottomNavIndividu, BottomNavLembaga)
│   ├── onboarding/
│   └── ui/                       # Komponen UI dasar (Button, TextField, Select, dll.)
│
├── config/
│   └── routes.ts                 # Definisi rute aplikasi
│
├── styles/
│   └── token.css                 # Variabel/token styling
│
└── public/
    ├── icons/                    # Ikon untuk PWA (manifest)
    ├── images/                   # Gambar statis
    └── sw.js                     # Service Worker PWA
    ├── manifest.json             # File manifest PWA
## Memulai Proyek

Pertama, instal dependensi:

```bash
npm install
# or
yarn install
# or
pnpm install

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev