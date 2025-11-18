"use client";

import React, { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Share2 } from 'lucide-react';
import clsx from 'clsx';
import { formatCarbonFootprint, getChangeTextColor, limitLeadingDigits } from '@/utils/carbonAnalysis';
import Image from "next/image";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userLoc: string;
    formattedTotal: string;
    changeAbs: number;
    formattedChangePct: string;
    previousMonthTotal: number | null;
    changeStatus: 'increase' | 'decrease' | 'same' | null;
    // lembaga support
    isInstitution?: boolean;
    institutionName?: string;
    institutionType?: string;
};

export default function ShareModal({
    isOpen,
    onClose,
    userName,
    userLoc,
    formattedTotal,
    changeAbs,
    formattedChangePct,
    previousMonthTotal,
    changeStatus,
    isInstitution = false,
    institutionName,
    institutionType,
}: Props) {
    const shareRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const makeFriendlyName = (n?: string) => {
        if (!n) return "";
        return n.includes("@") ? n.split("@")[0] : n;
    };
    const displayTitle = isInstitution
        ? (institutionName && institutionName.trim() !== "" ? institutionName : makeFriendlyName(userName))
        : makeFriendlyName(userName);
    const displaySubtitle = isInstitution ? (institutionType ?? userLoc) : userLoc;

    const handleCaptureAndShare = useCallback(async () => {
        if (typeof window === 'undefined' || !shareRef.current) return;

        setIsProcessing(true);
        toast.loading("Memproses visual untuk dibagikan...", { id: 'share-toast' });

        const sign = changeStatus === 'increase' ? '↑' : changeStatus === 'decrease' ? '↓' : '=';
        const statusText = changeStatus === 'decrease' ? 'menurun' : changeStatus === 'increase' ? 'meningkat' : 'stabil';
        const shareURL = 'cahayamu.id';

        try {
            const canvas = await html2canvas(shareRef.current, {
                useCORS: true,
                scale: 2,
                allowTaint: true,
                backgroundColor: null,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Gagal membuat gambar.", { id: 'share-toast' });
                    setIsProcessing(false);
                    return;
                }

                const shareFile = new File([blob], 'RingkasanKarbon.png', { type: 'image/png' });

                const accompanyingText =
                    `Halo! ${userName} baru saja cek Jejak Karbon bulan ini:\n\n` +
                    `🔥 Total Emisi: ${formatCarbonFootprint(Number(formattedTotal)).value} ${formatCarbonFootprint(Number(formattedTotal)).unit}\n` +
                    `📈 Progres: ${sign}${formattedChangePct}% (${statusText})\n\n` +
                    `Jika sekelilingmu gelap gulita, mungkin kamulah cahayanya.\n` +
                    `Yuk, kita sama-sama #SadariDampak dan kurangi jejak karbon! Cek punyamu sekarang:\n` +
                    `Mulai ukur di 1000 Cahaya! 👉 ${shareURL}`;

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: `Jejak Karbon Saya - ${formatCarbonFootprint(Number(formattedTotal)).value} ${formatCarbonFootprint(Number(formattedTotal)).unit}`,
                            text: accompanyingText,
                            files: [shareFile],
                        });

                        if (navigator.clipboard && document.hasFocus()) {
                            await navigator.clipboard.writeText(accompanyingText);
                        }

                        toast.success("Gambar berhasil dibagikan!", { id: 'share-toast' });
                        onClose();
                    } catch (err) {
                        console.log(err);
                        if (err instanceof Error && err.name !== 'AbortError') {
                            toast.warning(
                                "Berbagi gambar gagal (izin sistem). Salin teks ringkasan:",
                                {
                                    id: 'share-toast',
                                    duration: 10000,
                                    action: {
                                        label: 'Salin Teks',
                                        onClick: () => {
                                            void secureCopyToClipboard(accompanyingText);
                                        },
                                    },
                                }
                            );
                        } else {
                            toast.info("Berbagi dibatalkan.", { id: 'share-toast' });
                        }

                        setIsProcessing(false);
                    }
                } else {
                    if (navigator.clipboard && document.hasFocus()) {
                        await navigator.clipboard.writeText(accompanyingText);
                    }
                    toast.info("Web Share tidak didukung. Teks sudah disalin! Silakan screenshot manual.", { id: 'share-toast', duration: 5000 });
                    setIsProcessing(false);
                }

            }, 'image/png');


        } catch (err) {
            console.error("Capture Error:", err);
            toast.error("Terjadi kesalahan saat membuat gambar.", { id: 'share-toast' });
        } finally {
            setIsProcessing(false);
        }
    }, [formattedTotal, formattedChangePct, changeStatus, onClose, isInstitution, institutionName, institutionType, userName, userLoc]);

    const secureCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("✅ Teks berhasil disalin ke clipboard!");
            return true;
        } catch (err) {
            console.error("Secure copy failed:", err);
            return false;
        }
    };

    const backgroundImageURL = '/bg-share.png';
    const cardBackgroundColor = 'rgba(255, 255, 255, 0.85)';

    const prevTotalFormatted = previousMonthTotal !== null
        ? limitLeadingDigits(previousMonthTotal, 7)
        : '-';

    const changePctLength = formattedChangePct.length + (changeStatus === 'increase' || changeStatus === 'decrease' ? 1 : 0);

    let changePctFontSize = 'text-xl';
    if (changePctLength > 7) {
        changePctFontSize = 'text-sm';
    } else if (changePctLength > 5) {
        changePctFontSize = 'text-lg';
    }

    const changePrevLength = prevTotalFormatted.length;

    let changePrevFontSize = 'text-xl';
    if (changePrevLength > 8) {
        changePrevFontSize = 'text-sm';
    } else if (changePrevLength > 6) {
        changePrevFontSize = 'text-lg';
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Analisis Karbon">
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto p-1">
                <div
                    ref={shareRef}
                    className="p-6 flex flex-col justify-between items-center relative"
                    style={{
                        width: '300px',
                        paddingTop: '60px',
                        paddingBottom: '60px',
                        margin: 'auto',
                        backgroundImage: `url(${backgroundImageURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    <div
                        className="p-4 rounded-xl shadow-xl border border-gray-100 relative z-10"
                        style={{
                            width: '270px',
                            backgroundColor: cardBackgroundColor,
                        }}
                    >
                        <div className="flex items-center border-b border-gray-200 mb-3 pb-3">
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold">{displayTitle}</h3>
                                <p className="text-xs font-medium text-gray-500">{userLoc}</p>
                            </div>
                        </div>

                        <div className="text-xs mb-2 font-bold">Jejak Karbon Saya Bulan ini</div>
                        <div className="text-4xl mt-1 font-extrabold leading-none" style={{ color: 'var(--color-primary)' }}>
                            {formatCarbonFootprint(Number(formattedTotal)).value}

                        </div>
                        <p className="text-lg text-gray-600">{formatCarbonFootprint(Number(formattedTotal)).unit}</p>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs mb-2 font-bold">Perubahan dari Bulan Lalu</div>

                            <div className="flex justify-between gap-2">
                                <div
                                    className={clsx(
                                        "flex-1 p-3 rounded-lg flex flex-col items-center justify-center text-center",
                                        changeStatus === 'increase' ? 'bg-red-50/50' :
                                            changeStatus === 'decrease' ? 'bg-emerald-50/50' :
                                                'bg-gray-100/50'
                                    )}
                                >
                                    <div className="text-xs text-gray-600 mb-1">Persentase</div>
                                    <div
                                        className={clsx(
                                            "text-lg font-extrabold leading-none",
                                            changePctFontSize,
                                            getChangeTextColor(changeStatus)
                                        )}
                                    >
                                        {changeStatus === 'increase' ? '+' : ''}
                                        {changeStatus === 'decrease' ? '-' : ''}
                                        {formattedChangePct}%
                                    </div>
                                    <p className="text-[8px] text-black/60 mt-1">
                                        {changeStatus === 'decrease' ? 'Berkurang' : changeStatus === 'increase' ? 'Bertambah' : 'Tidak Berubah'} {formatCarbonFootprint(Math.abs(changeAbs)).value} {formatCarbonFootprint(Math.abs(changeAbs)).unit}
                                    </p>
                                </div>

                                <div className="flex-1 p-3 rounded-lg bg-gray-100/50 flex flex-col items-center justify-center text-center">
                                    <div className="text-xs text-gray-600 mb-1">Emisi Bulan Lalu</div>
                                    <div
                                        className={clsx(
                                            "text-lg font-extrabold leading-none text-gray-700",
                                            changePrevFontSize,
                                        )}
                                    >
                                        {/* {previousMonthTotal !== null
                                            ? limitLeadingDigits(previousMonthTotal, 7)
                                            : '-'} */}
                                        {formatCarbonFootprint(previousMonthTotal ?? 0).value}
                                    </div>
                                    <p className="text-[10px] text-black/60 mt-1">{formatCarbonFootprint(previousMonthTotal ?? 0).unit}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-gray-100 flex flex-col items-center justify-center gap-1.5 text-center">
                            <span className="text-xs font-semibold text-gray-700">
                                Jika sekelilingmu gelap gulita, mungkin kamulah cahayanya.
                            </span>

                            <Image
                                src="/logo.png"
                                alt="1000 Cahaya"
                                width={40}
                                height={40}
                                className="h-10 w-10 mt-1"
                                priority
                            />

                            <span className="text-sm font-medium text-emerald-600">
                                cahayamu.id
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-center text-black/70 mt-4">
                    Ringkasan visual ini akan dibagikan bersamaan dengan teks pendamping ke aplikasi media sosial pilihan Anda.
                </p>

                <Button
                    onClick={handleCaptureAndShare}
                    disabled={isProcessing}
                    size="lg"
                    fullWidth
                    className="mt-4"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    {isProcessing ? "Memproses..." : "Bagikan"}
                </Button>

            </div>
        </Modal>
    );
}