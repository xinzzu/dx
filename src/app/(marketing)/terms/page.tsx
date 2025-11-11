"use client"; // Diperlukan untuk useRouter

import { useRouter } from "next/navigation";
import Image from "next/image";
import ScrollContainer from "@/components/nav/ScrollContainer";

export default function TermsPage() {
  const router = useRouter();

  return (
     <ScrollContainer
                 headerTitle="Syarat dan Ketentuan"
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

      {/* Konten */}
      <main className="flex-grow p-6 text-gray-700">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-sm text-gray-500">
            Tanggal Berlaku Efektif: [Isi Tanggal Hari Ini]
          </p>
          <p>
            Selamat datang di 1000 Cahaya! Syarat dan Ketentuan (&ldquo;Ketentuan&rdquo;)
            ini mengatur akses Anda ke dan penggunaan aplikasi web (termasuk
            Progressive Web App/PWA) dan layanan (&ldquo;Layanan&rdquo;) 1000 Cahaya
            kami. Dengan mengakses atau menggunakan Layanan kami, Anda setuju
            untuk terikat oleh Ketentuan ini.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            1. Definisi Layanan
          </h2>
          <p>
            1000 Cahaya adalah platform digital yang dirancang untuk membantu
            pengguna Individu dan Lembaga melacak, menganalisis, dan memahami
            jejak karbon mereka. Fitur inti kami meliputi pencatatan emisi dari
            berbagai sumber (seperti transportasi dan penggunaan energi),
            visualisasi data, dan partisipasi dalam tantangan pengurangan emisi.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            2. Akun Pengguna
          </h2>
          <ul className="pl-5 space-y-2 list-disc list-outside">
            <li>
              <strong>Pendaftaran:</strong> Untuk menggunakan Layanan, Anda harus
              mendaftar akun dengan memberikan informasi yang akurat dan lengkap,
              termasuk alamat email dan kata sandi.
            </li>
            <li>
              <strong>Login Pihak Ketiga:</strong> Kami juga mengizinkan
              pendaftaran dan login melalui layanan pihak ketiga seperti Google.
            </li>
            <li>
              <strong>Keamanan Akun:</strong> Anda bertanggung jawab penuh untuk
              menjaga kerahasiaan kata sandi dan aktivitas akun Anda.
            </li>
          </ul>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            3. Penggunaan Layanan
          </h2>
          <ul className="pl-5 space-y-2 list-disc list-outside">
            <li>
              <strong>Pencatatan Data:</strong> Anda dapat memasukkan data
              terkait aktivitas Anda (misalnya, jarak tempuh kendaraan, konsumsi
              listrik). Akurasi dari data yang Anda masukkan sepenuhnya menjadi
              tanggung jawab Anda.
            </li>
            <li>
              <strong>Akurasi Perhitungan:</strong> Perhitungan jejak karbon yang
              disediakan oleh 1000 Cahaya adalah <em>estimasi</em> berdasarkan
              data yang Anda berikan dan faktor emisi standar. Kami tidak
              menjamin keakuratan absolut dan tidak bertanggung jawab atas
              keputusan yang dibuat berdasarkan estimasi ini.
            </li>
            <li>
              <strong>Pengguna Lembaga:</strong> Pengguna Lembaga dapat
              mendaftarkan aset (seperti gedung atau kendaraan) untuk pelacakan
              kolektif.
            </li>
          </ul>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            4. Penggunaan yang Dilarang
          </h2>
          <p>Anda setuju untuk tidak:</p>
          <ul className="pl-5 space-y-2 list-disc list-outside">
            <li>Menggunakan layanan untuk tujuan ilegal.</li>
            <li>Memasukkan data yang salah atau menyesatkan dengan sengaja.</li>
            <li>
              Mencoba merekayasa balik (reverse-engineer) atau mengganggu
              integritas sistem dan Layanan kami.
            </li>
          </ul>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            5. Pembatasan Tanggung Jawab
          </h2>
          <p>
            Layanan 1000 Cahaya disediakan &ldquo;sebagaimana adanya&rdquo; (as is).
            Kami tidak bertanggung jawab atas kerugian tidak langsung,
            insidental, atau konsekuensial yang timbul dari penggunaan atau
            ketidakmampuan Anda menggunakan Layanan kami.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">
            6. Perubahan Ketentuan
          </h2>
          <p>
            Kami dapat mengubah Ketentuan ini dari waktu ke waktu. Jika perubahan
            tersebut material, kami akan memberi tahu Anda (misalnya, melalui
            email atau notifikasi dalam aplikasi).
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-black">7. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Ketentuan ini, silakan hubungi
            kami di [Email Kontak Anda].
          </p>
        </div>
      </main>
    </ScrollContainer>
  );
}
