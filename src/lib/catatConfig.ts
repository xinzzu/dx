export type CategoryConfig = {
  id: string;
  title: string;
  subtitle: string;
  iconSrc: string;
  href: (base?: string) => string;
};

export const CATEGORIES_BY_USER: Record<"individu" | "lembaga", CategoryConfig[]> = {
  individu: [
    {
      id: "transport",
      title: "Transportasi",
      subtitle: "Kendaraan operasional",
      iconSrc: "/images/catat/transport.png",
      href: (base = "/app/catat") => `${base}/transportasi`,
    },
    {
      id: "listrik",
      title: "Penggunaan Listrik",
      subtitle: "Konsumsi energi listrik",
      iconSrc: "/images/catat/energy.png",
      href: (base = "/app/catat") => `${base}/energi-listrik`,
    },
    {
      id: "makanan",
      title: "Konsumsi Makanan",
      subtitle: "Makanan yang Anda konsumsi",
      iconSrc: "/images/catat/food.png",
      href: (base = "/app/catat") => `${base}/konsumsi-makanan`,
    },
  ],
  lembaga: [
    {
      id: "transport",
      title: "Transportasi",
      subtitle: "Transport operasional lembaga",
      iconSrc: "/images/catat/transport.png",
      href: (base = "/app/catat") => `${base}/transportasi`,
    },
    {
      id: "listrik",
      title: "Penggunaan Listrik",
      subtitle: "Konsumsi energi listrik",
      iconSrc: "/images/catat/energy.png",
      href: (base = "/app/catat") => `${base}/energi-listrik`,
    },
    {
      id: "sampah",
      title: "Produksi Sampah",
      subtitle: "Sampah operasional lembaga",
      iconSrc: "/images/catat/trash.png",
      href: (base = "/app/catat") => `${base}/produksi-sampah`,
    },
  ],
};

export default CATEGORIES_BY_USER;
