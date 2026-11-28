import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0E4A3E] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8 md:gap-16">
        
        {/* Left Section: Main Title & Description */}
        <div className="max-w-xl space-y-2 sm:space-y-3">
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white uppercase leading-snug">
              KULIAH KERJA NYATA INTERNASIONAL
            </h2>
            <h3 className="text-[11px] sm:text-sm font-semibold tracking-wide text-white/90 uppercase">
              UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON
            </h3>
          </div>

          <p className="italic text-xs sm:text-sm md:text-base text-gray-200 font-normal leading-relaxed pt-1 sm:pt-2">
            Program Kuliah Kerja Nyata (KKN) Internasional UIN Siber Syekh Nurjati Cirebon, hadir sebagai wadah pengabdian mahasiswa di ranah internasional dengan semangat kolaborasi, budaya, dan kebermanfaatan
          </p>
        </div>

        {/* Right Section: Contact Information & Copyright */}
        <div className="flex flex-col space-y-5 sm:space-y-6 w-full md:w-auto md:min-w-[280px]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3">
              Kontak Kami
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-200">
              {/* Location */}
              <li className="flex items-start gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 shrink-0 text-white fill-none stroke-current stroke-2 mt-0.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Jl. Perjuangan ByPass Sunyaragi Cirebon 45132</span>
              </li>

              {/* Email */}
              <li className="flex items-start gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 shrink-0 text-white fill-none stroke-current stroke-2 mt-0.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <a 
                  href="mailto:lp2m@uinssc.ac.id" 
                  className="hover:underline transition-all break-all"
                >
                  lp2m@uinssc.ac.id
                </a>
              </li>

              {/* Phone & Fax */}
              <li className="flex items-start gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 shrink-0 text-white fill-none stroke-current stroke-2 mt-0.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>
                  <a href="tel:0231481264" className="hover:underline transition-all">
                    (0231) 481264
                  </a>
                  {' '}Faksimili (0231) 489926
                </span>
              </li>

              {/* Website */}
              <li className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 shrink-0 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                <a 
                  href="https://lp2m.uinssc.ac.id/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline transition-all"
                >
                  lp2m.uinssc.ac.id
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright notice */}
          <div className="pt-2 text-xs sm:text-sm text-gray-300">
            @ 2026 kkn internasional UINSSC
          </div>
        </div>

      </div>
    </footer>
  );
}
