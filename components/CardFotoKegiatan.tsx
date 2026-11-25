'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Globe2 } from 'lucide-react';

interface NegaraItem {
  id_negara: number;
  nama_negara: string;
  status: boolean;
  foto?: string;
  deskripsi?: string;
  isActiveInCurrentPeriode: boolean;
}

export default function CardFotoKegiatan() {
  const [items, setItems] = useState<NegaraItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/negara?status=aktif');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Filter negara yang berstatus aktif di periode berjalan saat ini
          const activeInPeriode = json.data.filter(
            (n: NegaraItem) => n.isActiveInCurrentPeriode && n.status
          );

          if (activeInPeriode.length > 0) {
            setItems(activeInPeriode);
          } else {
            // Fallback: jika belum ada periode aktif yang dihubungkan, tampilkan negara master yang berstatus aktif
            setItems(json.data.filter((n: NegaraItem) => n.status).slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Gagal memuat foto kegiatan negara:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <section className="w-full py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-white font-sans">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-10 space-y-1">
          <h2 className="text-base sm:text-2xl md:text-3xl font-archivo text-[#0E4A3E] tracking-tight uppercase">
            FOTO KEGIATAN
          </h2>
          <h3 className="text-xs sm:text-lg md:text-xl font-archivo text-[#0E4A3E]">
            KKN Internasional UINSSC
          </h3>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#0E4A3E] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Memuat foto kegiatan negara...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl max-w-md">
            <Globe2 className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs sm:text-sm font-semibold">Belum ada negara yang diaktifkan untuk periode ini.</p>
          </div>
        ) : (
          /* Cards Container - 2 Kolom Sejajar di HP (grid-cols-2) */
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 md:gap-8 w-full max-w-4xl">
            {items.map((item) => {
              const displayFoto = item.foto || (
                item.nama_negara.toLowerCase().includes('thailand')
                  ? '/thailand_kkn.jpg'
                  : item.nama_negara.toLowerCase().includes('filipina')
                  ? '/filipina_kkn.jpg'
                  : '/hero_bg.jpg'
              );

              return (
                <div
                  key={item.id_negara}
                  className="bg-[#0E4A3E] text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 md:p-6 shadow-md w-full flex flex-col items-center transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Image Frame */}
                  <div className="relative w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-4 bg-emerald-950/40 border border-emerald-600/30">
                    <Image
                      src={displayFoto}
                      alt={item.nama_negara}
                      fill
                      sizes="(max-width: 768px) 50vw, 50vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Text Description */}
                  <div className="text-center px-1 space-y-0.5 sm:space-y-1.5 w-full">
                    <h4 className="text-xs sm:text-base md:text-lg font-bold text-white leading-tight line-clamp-1">
                      KKN Internasional {item.nama_negara}
                    </h4>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-200 leading-snug font-normal line-clamp-2 sm:line-clamp-none">
                      {item.deskripsi ||
                        `Program pengabdian dan kemitraan kolaboratif mahasiswa UINSSC di negara ${item.nama_negara}.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

