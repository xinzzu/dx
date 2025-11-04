"use client"; // Diperlukan untuk useRouter

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header dengan Tombol Kembali */}
      <header className="sticky top-0 z-10 flex items-center w-full h-16 px-4 bg-white border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="Kembali"
        >
          <Image
            src="/arrow-left.svg"
            width={24}
            height={24}
            alt="Kembali"
          />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-center text-gray-800">
          Kebijakan Privasi
        </h1>
        <div className="w-8"></div> {/* Spacer untuk menyeimbangkan judul */}
      </header>

      {/* Konten */}
      <main className="flex-grow p-6 text-gray-700">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-sm text-gray-500">
            Tanggal Berlaku Efektif: [Isi Tanggal Hari Ini]
          </p>
          <p>
            1000 Cahaya (&ldquo;kami&rdquo;) berkomitmen untuk melindungi privasi
            Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan,
            menggunakan, dan melindungi informasi Anda saat Anda menggunakan
            Layanan kami.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            1. Informasi yang Kami Kumpulkan
          </h2>
          <ul className="pl-5 space-y-2 list-disc list-outside">
            <li>
              <strong>Informasi yang Anda Berikan:</strong>
              <ul className="pl-5 mt-2 space-y-2 list-circle list-outside">
                <li>
                  <strong>Data Pendaftaran:</strong> Saat Anda membuat akun, kami
                  mengumpulkan alamat email dan kata sandi Anda (yang disimpan
                  secara terenkripsi).
                </li>
                <li>
                  <strong>Data Aktivitas:</strong> Informasi inti yang Anda catat
                  di aplikasi, seperti data konsumsi energi, detail perjalanan,
                  dan data pengelolaan limbah.
                </li>
                <li>
                  <strong>Data Lembaga:</strong> Jika Anda pengguna Lembaga, kami
                  mengumpulkan data tentang aset yang Anda daftarkan (gedung
                  atau kendaraan).
                </li>
              </ul>
            </li>
            <li>
              <strong>Informasi dari Pihak Ketiga:</strong>
              <ul className="pl-5 mt-2 space-y-2 list-circle list-outside">
                <li>
                  Jika Anda login menggunakan Google, kami akan menerima
                  informasi profil dasar (seperti nama dan alamat email Anda)
                  dari Google.
                </li>
              </ul>
            </li>
            <li>
              <strong>Informasi Teknis (Otomatis):</strong>
              <ul className="pl-5 mt-2 space-y-2 list-circle list-outside">
                <li>
                  Kami dapat mengumpulkan data teknis seperti alamat IP, jenis
                  browser, dan data penggunaan perangkat.
                </li>
              </ul>
            </li>
          </ul>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            2. Bagaimana Kami Menggunakan Informasi Anda
          </h2>
          <p>Kami menggunakan informasi Anda untuk:</p>
          <ul className="pl-5 space-y-2 list-disc list-outside">
            <li>
              <strong>Menyediakan Layanan Inti:</strong> Untuk menghitung jejak
              karbon Anda, menampilkan analisis data, dan mengelola akun Anda.
            </li>
            <li>
              <strong>Personalisasi:</strong> Untuk menawarkan konten yang
              relevan, seperti tantangan atau tips.
            </li>
            <li>
              <strong>Komunikasi:</strong> Untuk mengirimi Anda pembaruan
              layanan atau menanggapi pertanyaan Anda.
            </li>
            <li>
              <strong>Riset (Data Agregat):</strong> Kami dapat menggunakan data
              aktivitas secara <em>anonim dan agregat</em> untuk analisis tren
              atau riset lingkungan.
            </li>
          </ul>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            3. Berbagi Informasi
          </h2>
          <p>
            Kami <strong>tidak</strong> menjual atau menyewakan data pribadi
            Anda. Kami hanya dapat membagikan informasi Anda dengan penyedia
Services
            layanan (misalnya, hosting), jika diwajibkan oleh hukum, atau dengan
            persetujuan Anda.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            4. Keamanan dan Penyimpanan Data
          </h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis untuk melindungi data
            Anda. Karena 1000 Cahaya adalah PWA, sebagian data Anda mungkin
            disimpan secara lokal di perangkat Anda (cache) untuk fungsionalitas
            offline.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            5. Hak Anda
          </h2>
          <p>
            Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus
            informasi pribadi Anda. Anda dapat mengelola ini dari halaman profil
            Anda atau dengan menghubungi kami.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">6. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan
            hubungi kami di [Email Kontak Anda].
          </p>
        </div>
      </main>
    </div>
  );
}
