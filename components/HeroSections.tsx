'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
];

export default function HeroSections() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  // Otomatis berganti slide (Auto-scroll / Autoplay) setiap 5 detik
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const activeSlide = slides[currentSlide];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[520px] sm:h-[600px] bg-emerald-950 text-white overflow-hidden font-sans group"
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
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/40 pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-6 sm:px-12 lg:px-20 flex flex-col justify-center items-start">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-archivo tracking-tight leading-tight text-white uppercase drop-shadow-md transition-all duration-500">
            {activeSlide.title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed font-light drop-shadow transition-all duration-500">
            {activeSlide.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/login"
              className="bg-[#0E4A3E] text-white border border-white/20 hover:bg-[#0a382f] px-7 py-3 rounded-full font-semibold text-sm sm:text-base shadow-xl transition-all hover:scale-105"
            >
              Daftar Sekarang
            </Link>

            <Link
              href="/informasi"
              className="bg-black/40 backdrop-blur-sm border border-white/60 text-white hover:bg-white/20 px-7 py-3 rounded-full font-semibold text-sm sm:text-base shadow-xl transition-all hover:scale-105"
            >
              Lihat Informasi
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all text-xl focus:outline-none cursor-pointer hover:scale-110"
      >
        &#10094;
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all text-xl focus:outline-none cursor-pointer hover:scale-110"
      >
        &#10095;
      </button>

      {/* Indicators / Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === index
                ? 'bg-[#568E7D] w-7'
                : 'bg-white/60 hover:bg-white w-3'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

