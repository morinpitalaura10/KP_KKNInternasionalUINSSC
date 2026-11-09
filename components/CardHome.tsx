import React from 'react';
import Link from 'next/link';

interface CardInfoItem {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  icon: React.ReactNode;
}

const cardItems: CardInfoItem[] = [
  {
    id: 1,
    title: 'Informasi KKN Internasional',
    description: 'Kenali lebih dalam tentang program KKN Internasional, lokasi dan kegiatan yang akan dilakukan.',
    buttonText: 'Lihat Informasi',
    buttonHref: '/informasi',
    icon: (
      /* Info Icon (i) */
      <svg className="w-7 h-7 text-[#0E4A3E] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Persyaratan KKN Internasional',
    description: 'Cek persyaratan lengkap yang perlu kamu siapkan sebelum mendaftar.',
    buttonText: 'Lihat Persyaratan',
    buttonHref: '/persyaratan',
    icon: (
      /* List / Checklist Icon */
      <svg className="w-7 h-7 text-[#0E4A3E] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="3.5" cy="6" r="1.5" fill="currentColor" />
        <circle cx="3.5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Timeline KKN Internasional',
    description: 'Lihat jadwal dan tahapan pendaftaran hingga pengumuman hasil seleksi.',
    buttonText: 'Lihat Timeline',
    buttonHref: '/timeline',
    icon: (
      /* Timeline / Trending Icon */
      <svg className="w-7 h-7 text-[#0E4A3E] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Pengumuman KKN Internasional',
    description: 'Dapatkan informasi terbaru terkait KKN Internasional.',
    buttonText: 'Lihat Pengumuman',
    buttonHref: '/pengumuman',
    icon: (
      /* Megaphone / Bell Icon */
      <svg className="w-7 h-7 text-[#0E4A3E] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 18-5v12L3 13v-2z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
  },
];

export default function CardHome() {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white font-sans">
      <div className="max-w-7xl mx-auto">
        {/* 4 Cards Grid (Hijau Muda #568E7D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardItems.map((card) => (
            <div
              key={card.id}
              className="bg-[#568E7D] text-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-h-[300px]"
            >
              {/* Top Section: Icon & Content */}
              <div className="flex flex-col items-center space-y-3 w-full">
                {/* Circle Icon Badge */}
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md mb-1">
                  {card.icon}
                </div>

                {/* Card Title */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {/* Bottom Section: Action Button */}
              <div className="pt-5 w-full flex justify-center">
                <Link
                  href={card.buttonHref}
                  className="bg-[#0E4A3E] hover:bg-[#09352c] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-105"
                >
                  {card.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

