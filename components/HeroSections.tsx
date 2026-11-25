'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  description: string;
  bgImage: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'BERKOLABORASI UNTUK MEMBERI DAMPAK GLOBAL',
    description:
      'Program Kuliah Kerja Nyata (KKN) Internasional UIN Siber Syekh Nurjati Cirebon, hadir sebagai wadah pengabdian mahasiswa di ranah internasional dengan semangat kolaborasi, budaya, dan kebermanfaatan',
    bgImage: '/hero_bg.jpg',
  },
  {
    id: 2,
    title: 'MENGABDI DI RANAH INTERNASIONAL',
    description:
      'Memperluas wawasan global dan memberikan kontribusi nyata bagi masyarakat internasional melalui program KKN UINSSC',
    bgImage: '/thailand_kkn.jpg',
  },
  {
    id: 3,
    title: 'PENGALAMAN GLOBAL, DAMPAK NYATA',
    description:
      'Membangun jejaring lintas negara, mengasah kepemimpinan, dan menyebarkan syiar kebermanfaatan di kancah dunia',
    bgImage: '/filipina_kkn.jpg',
  },
];

export default function HeroSections() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  // Otomatis berganti slide (Auto-scroll / Autoplay) setiap 4 detik
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Touch Swipe Handlers untuk HP / Layar Sentuh
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 45) {
      // Geser ke kiri -> slide berikutnya
      nextSlide();
    } else if (diff < -45) {
      // Geser ke kanan -> slide sebelumnya
      prevSlide();
    }
    touchStartX.current = null;
  };

  const activeSlide = slides[currentSlide];

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => {
        // Hanya pause jika desktop mouse hover nyata (bukan sentuhan HP)
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsPaused(false);
        }
      }}
      className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] bg-emerald-950 text-white overflow-hidden font-sans group select-none touch-pan-y"
    >
      {/* Background Images with smooth Cross-fade transition */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.bgImage}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover brightness-75 transition-transform duration-7000 ease-out transform scale-100"
            />
          </div>
        ))}
        {/* Dark vignette overlay for contrast & readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/45 pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-5 sm:px-10 lg:px-20 flex flex-col justify-center items-start">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-archivo tracking-tight leading-tight text-white uppercase drop-shadow-md transition-all duration-500">
            {activeSlide.title}
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-gray-200 leading-relaxed font-light drop-shadow transition-all duration-500">
            {activeSlide.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
            <Link
              href="/login"
              className="bg-[#0E4A3E] text-white text-center border border-white/20 hover:bg-[#0a382f] px-6 py-2.5 sm:px-7 sm:py-3 rounded-full font-semibold text-xs sm:text-base shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Daftar Sekarang
            </Link>

            <Link
              href="/informasi"
              className="bg-black/40 backdrop-blur-sm border border-white/60 text-white text-center hover:bg-white/20 px-6 py-2.5 sm:px-7 sm:py-3 rounded-full font-semibold text-xs sm:text-base shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Lihat Informasi
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next Controls (Responsif untuk HP & Desktop) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 text-white hover:bg-black/70 active:scale-90 transition-all text-sm sm:text-xl focus:outline-none cursor-pointer items-center justify-center backdrop-blur-xs touch-manipulation shadow-md"
      >
        &#10094;
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 text-white hover:bg-black/70 active:scale-90 transition-all text-sm sm:text-xl focus:outline-none cursor-pointer items-center justify-center backdrop-blur-xs touch-manipulation shadow-md"
      >
        &#10095;
      </button>

      {/* Indicators / Dots dengan area sentuh luas untuk HP */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`p-1.5 cursor-pointer touch-manipulation group flex items-center justify-center`}
          >
            <span
              className={`block h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-emerald-400 w-6 sm:w-7 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-white/60 group-hover:bg-white w-2 sm:w-2.5'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

