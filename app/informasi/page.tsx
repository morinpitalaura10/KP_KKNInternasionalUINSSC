import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { QuickStatItem } from '@/components/InfoCard';
import InformasiCategoryBar from '@/components/InformasiCategoryBar';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatDateID(dateStr?: string | Date | null) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return String(dateStr);
    }
}

export default async function InformasiPage() {
    let infoTentang: any = null;
    let activePeriode: any = null;
    let lolosCount = 0;
    let openCountries: { id_negara: number; nama_negara: string; foto?: string | null; deskripsi?: string | null }[] = [];

    try {
        activePeriode = await prisma.periode.findFirst({
            where: { status: 'Aktif' },
            include: {
                periode_negara: {
                    where: { status: true, negara: { status: true } },
                    include: { negara: true },
                },
                timeline: {
                    where: { status: true },
                    orderBy: { urutan: 'asc' },
                },
            },
        });

        // Ambil 1 informasi utama yang sedang berstatus Aktif
        infoTentang = await prisma.informasi.findFirst({
            where: {
                status: true,
                ...(activePeriode ? {
                    OR: [
                        { id_periode: activePeriode.id_periode },
                        { id_periode: null },
                    ],
                } : { id_periode: null }),
            },
            include: {
                periode: { select: { nama_periode: true, tahun: true } },
            },
            orderBy: [
                { id_periode: 'desc' },
                { updated_at: 'desc' },
                { created_at: 'desc' },
            ],
        });

        if (activePeriode) {
            lolosCount = await prisma.hasil_seleksi.count({
                where: {
                    status: 'Lolos',
                    pendaftaran: { id_periode: activePeriode.id_periode },
                },
            });

            const pnCountries = (activePeriode.periode_negara || [])
                .map((pn: any) => ({
                    id_negara: pn.negara?.id_negara,
                    nama_negara: pn.negara?.nama_negara,
                    foto: pn.negara?.foto,
                    deskripsi: pn.negara?.deskripsi,
                }))
                .filter((c: any) => Boolean(c.nama_negara));

            if (pnCountries.length > 0) {
                openCountries = pnCountries;
            } else {
                // Sesuai dengan data master negara aktif yang dipakai di halaman informasi mahasiswa
                const allActive = await prisma.negara.findMany({
                    where: { status: true },
                    orderBy: { id_negara: 'asc' },
                });
                openCountries = allActive.map((n) => ({
                    id_negara: n.id_negara,
                    nama_negara: n.nama_negara,
                    foto: n.foto,
                    deskripsi: n.deskripsi,
                }));
            }
        }
    } catch (error) {
        console.warn('Tidak dapat terhubung ke database di InformasiPage:', error);
    }

    // Cari tahapan pelaksanaan KKN dari timeline (prioritas: is_pelaksanaan = true, fallback keyword)
    const timelineStages: any[] = activePeriode?.timeline || [];
    const pelaksanaanStage = 
        timelineStages.find((s) => s.is_pelaksanaan) ||
        timelineStages.find((s) => s.nama_tahapan?.toLowerCase().includes('pelaksanaan')) ||
        null;

    const targetStartDate = pelaksanaanStage?.tanggal_mulai || activePeriode?.tanggal_mulai;
    const targetEndDate = pelaksanaanStage?.tanggal_selesai || activePeriode?.tanggal_selesai;

    // Hitung durasi hari pelaksanaan KKN
    const durasiHari = (() => {
        if (!targetStartDate || !targetEndDate) return null;
        const start = new Date(targetStartDate).getTime();
        const end = new Date(targetEndDate).getTime();
        const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : null;
    })();

    const jadwalValue = targetStartDate && targetEndDate
        ? `${formatDateID(targetStartDate)} – ${formatDateID(targetEndDate)}`
        : 'Menunggu Penetapan Periode';

    const jadwalSubValue = activePeriode
        ? `${activePeriode.nama_periode} (${durasiHari ? `${durasiHari} hari kalender` : `Tahun ${activePeriode.tahun}`})`
        : 'Jadwal mengikuti periode aktif yang ditetapkan Admin LP2M.';

    const countryValue = openCountries.length > 0
        ? openCountries.map((c) => c.nama_negara).join(', ')
        : 'Belum ada negara dibuka';

    const countrySubValue = openCountries.length > 0 && openCountries[0]?.deskripsi
        ? openCountries.map((c) => `${c.nama_negara}: ${c.deskripsi}`).join(' | ')
        : 'Negara mitra penempatan KKN Internasional pada periode aktif.';

    const kuotaValue = activePeriode?.kuota !== undefined && activePeriode?.kuota !== null
        ? `${activePeriode.kuota} Mahasiswa Terpilih`
        : (lolosCount > 0 ? `${lolosCount} Mahasiswa Terpilih` : '6 Mahasiswa Terpilih');

    const kuotaSubValue = 'Kuota resmi delegasi mahasiswa yang ditetapkan LP2M pada periode aktif ini.';

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans scroll-smooth">
            {/* Header Bar */}
            <Header />

            <main className="flex-1 w-full">

                {/* Top Title & Category Navigation Bar (White Background Area) */}
                <section className="py-6 sm:py-10 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">

                        {/* Title Block (Aligned with consistent container margins) */}
                        <div className="text-left space-y-1.5 sm:space-y-2">
                            <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-archivo text-[#0E4A3E] tracking-tight leading-tight uppercase">
                                INFORMASI SINGKAT TENTANG <br className="hidden sm:block" />
                                KULIAH KERJA NYATA INTERNASIONAL
                            </h1>
                            <h2 className="text-[10px] sm:text-base md:text-lg lg:text-xl font-archivo text-[#0E4A3E] uppercase tracking-wide leading-tight">
                                UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON
                            </h2>
                            <p className="text-[11px] sm:text-sm text-gray-600 max-w-2xl text-left font-normal leading-relaxed pt-0.5 sm:pt-1">
                                Pelajari lebih lanjut mengenai program, tujuan, lokasi, dan kegiatan KKN Internasional UIN Siber Syekh Nurjati Cirebon
                            </p>
                        </div>

                        {/* Safe Query String Category Bar (?tab=...) */}
                        <div className="pt-1 sm:pt-2">
                            <InformasiCategoryBar />
                        </div>

                    </div>
                </section>

                {/* Main Content Area (Sage Green Background #568E7D) */}
                <section className="bg-[#568E7D] text-white py-8 sm:py-14">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">

                        {/* 1. TENTANG KKN INTERNASIONAL (Framed into neat, clean card container) */}
                        <div id="tentang" className="scroll-mt-24 bg-white/10 border border-white/25 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-xl space-y-4 sm:space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/20 pb-3 sm:pb-4">
                                <h2 className="text-base sm:text-2xl md:text-3xl font-archivo text-white tracking-wide uppercase">
                                    {infoTentang?.judul || 'TENTANG KKN INTERNASIONAL'}
                                </h2>
                                {infoTentang?.periode?.nama_periode && 
                                 !infoTentang.judul?.toLowerCase().includes(infoTentang.periode.nama_periode.toLowerCase()) && (
                                    <span className="text-xs font-bold bg-[#C0E6D8] text-[#0E4A3E] px-3.5 py-1 rounded-full shadow-xs">
                                        {infoTentang.periode.nama_periode}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
                                {/* Left Description Text */}
                                <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-emerald-50/95 text-xs sm:text-base leading-relaxed">
                                    {infoTentang?.isi ? (
                                        <p className="whitespace-pre-line leading-relaxed font-normal">
                                            {infoTentang.isi}
                                        </p>
                                    ) : (
                                        <div className="p-4 sm:p-6 rounded-2xl bg-white/10 border border-white/20 text-emerald-100 text-xs sm:text-sm space-y-1.5">
                                            <p className="font-bold text-white text-sm sm:text-base">
                                                Informasi Belum Diaktifkan
                                            </p>
                                            <p className="text-white/80 leading-relaxed font-normal">
                                                Saat ini belum ada artikel informasi yang diaktifkan oleh administrator. Silakan aktifkan informasi melalui menu Kelola Informasi di Admin untuk menampilkannya di sini.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Photo Frame */}
                                <div className="lg:col-span-5">
                                    <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white overflow-hidden shadow-xl bg-emerald-900/30">
                                        <Image
                                            src={infoTentang?.gambar || '/uinssc_delegates.jpg?v=2'}
                                            alt={infoTentang?.judul || 'Mahasiswa KKN Internasional UINSSC'}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 1024px) 100vw, 40vw"
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Pelaksanaan KKN Internasional (Key Stats Cards) */}
                        <div id="tujuan" className="scroll-mt-24 bg-white/10 border border-white/25 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-xl space-y-5 sm:space-y-6">
                            <div className="text-center space-y-1 border-b border-white/20 pb-3 sm:pb-4">
                                <h3 className="text-base sm:text-2xl font-archivo text-white tracking-wide uppercase">
                                    PELAKSANAAN KKN INTERNASIONAL
                                </h3>
                                {activePeriode && (
                                    <p className="text-[11px] sm:text-sm font-semibold text-emerald-100/90">
                                        Periode Aktif: {activePeriode.nama_periode} ({activePeriode.tahun})
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2">
                                {/* Stat 1: Waktu & Periode */}
                                <QuickStatItem
                                    icon={
                                        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                            <line x1="16" x2="16" y1="2" y2="6" />
                                            <line x1="8" x2="8" y1="2" y2="6" />
                                            <line x1="3" x2="21" y1="10" y2="10" />
                                        </svg>
                                    }
                                    label="Waktu & Periode"
                                    value={jadwalValue}
                                    subValue={jadwalSubValue}
                                />

                                {/* Stat 2: Negara & Lokasi Tujuan */}
                                <QuickStatItem
                                    icon={
                                        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                            <path d="M2 12h20" />
                                        </svg>
                                    }
                                    label="Negara & Lokasi Tujuan"
                                    value={countryValue}
                                    subValue={countrySubValue}
                                />

                                {/* Stat 3: Kuota Delegasi Peserta */}
                                <QuickStatItem
                                    icon={
                                        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    }
                                    label="Kuota Delegasi Peserta"
                                    value={kuotaValue}
                                    subValue={kuotaSubValue}
                                />
                            </div>
                        </div>

                    </div>
                </section>

            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
