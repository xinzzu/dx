export type DailyTip = {
    headline: string;
    body: string;
    variant: 'primary';
};

export const dailyTips: DailyTip[] = [
    {
        headline: "Jangan Lupa Catat Hari Ini",
        body: "Perjalanan, makanan, atau belanjaan? Catat semua aktivitasmu agar data bulan ini tetap lengkap dan akurat.",
        variant: "primary"
    },
    {
        headline: "Baru Saja Bepergian?",
        body: "Catat perjalananmu, penggunaan listrik, atau aktivitas lain untuk melihat pembaruan jejak karbonmu secara real-time.",
        variant: "primary"
    },
    {
        headline: "Jaga Datamu Tetap Akurat",
        body: "Semakin rajin kamu mencatat, semakin akurat pantauan jejak karbonmu. Yuk, tambahkan aktivitas terbarumu.",
        variant: "primary"
    },
    {
        headline: "Lanjutkan Progres Hijau-mu!",
        body: "Setiap catatan baru adalah langkah untuk lebih sadar. Terus tambahkan aktivitas harianmu untuk melengkapi gambaran bulan ini.",
        variant: "primary"
    },
    {
        headline: "Sudah Cek Catatan Harianmu?",
        body: "Jadikan kebiasaan! Luangkan 1 menit untuk mencatat aktivitas harianmu dan pantau terus dampak positifmu.",
        variant: "primary"
    },
    {
        headline: "Yuk, Tambah Catatan Lagi!",
        body: "Ada aktivitas baru yang belum tercatat? Klik di sini untuk menambahkannya dengan cepat dan mudah.",
        variant: "primary"
    },
    {
        headline: "Pahami Dampak Harianmu",
        body: "Dengan mencatat secara rutin, kamu akan melihat pola konsumsi dan dampaknya. Tambahkan catatan terbarumu di sini.",
        variant: "primary"
    },
    {
        headline: "Ada Aktivitas Baru?",
        body: "Baik itu makan siang, belanja, atau perjalanan pulang kerja. Jangan biarkan ada yang terlewat, catat semuanya!",
        variant: "primary"
    },
    {
        headline: "Jangan Sampai Ada yang Terlewat",
        body: "Pastikan catatanmu selengkap mungkin. Setiap data kecil membantu memberikan gambaran besar yang lebih akurat.",
        variant: "primary"
    },
    {
        headline: "Kerjamu Bagus, Lanjutkan!",
        body: "Kamu sudah mencatat dengan baik bulan ini. Terus catat aktivitas harianmu untuk melihat seberapa jauh kamu bisa berkembang.",
        variant: "primary"
    }
];

export function getRandomTip() {
    const randomIndex = Math.floor(Math.random() * dailyTips.length);
    return dailyTips[randomIndex];
}