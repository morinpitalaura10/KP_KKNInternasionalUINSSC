'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface SliderPuzzleCaptchaProps {
  onSuccess: () => void;
  onReset?: () => void;
}

// Dimensi mungil & proporsional
const CANVAS_WIDTH = 260;
const CANVAS_HEIGHT = 100;
const PIECE_SIZE = 34;
const TAB_R = 6;
const PADDING = 14; // Area batas untuk lekukan tab puzzle agar tidak terpotong
const START_X = 12; // Posisi awal kepingan puzzle di kiri
const TOLERANCE = 10; // Toleransi presisi pixel yang nyaman dan ramah

const PUZZLE_IMAGES = [
  '/uinssc_delegates.jpg',
  '/thailand_kkn.jpg',
  '/filipina_kkn.jpg',
];

export default function SliderPuzzleCaptcha({
  onSuccess,
  onReset,
}: SliderPuzzleCaptchaProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pieceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ clientX: number; sliderX: number } | null>(null);
  const loadTokenRef = useRef<number>(0);

  const [targetX, setTargetX] = useState<number>(140);
  const [targetY, setTargetY] = useState<number>(30);
  const [sliderX, setSliderX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'dragging' | 'success' | 'failed'>('idle');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);

  // Path bentuk kepingan puzzle (modern jigsaw dengan lekukan Bézier yang halus & proporsional)
  const drawPuzzlePath = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const l = PIECE_SIZE; // 34px
    const cr = 3; // Sudut kotak sedikit membulat agar modern & rapi
    const tw = 12; // Lebar tab
    const th = 6.5; // Tinggi tonjolan tab
    const midX = x + l / 2;
    const midY = y + l / 2;

    ctx.beginPath();
    ctx.moveTo(x + cr, y);

    // 1. SISI ATAS: garis dengan tonjolan tab Bézier yang mengalir mulus
    ctx.lineTo(midX - tw / 2, y);
    ctx.bezierCurveTo(
      midX - tw / 3, y - th * 0.45,
      midX - tw / 2.2, y - th,
      midX, y - th
    );
    ctx.bezierCurveTo(
      midX + tw / 2.2, y - th,
      midX + tw / 3, y - th * 0.45,
      midX + tw / 2, y
    );
    ctx.lineTo(x + l - cr, y);
    ctx.arcTo(x + l, y, x + l, y + cr, cr);

    // 2. SISI KANAN: garis dengan tonjolan tab Bézier yang mengalir mulus
    ctx.lineTo(x + l, midY - tw / 2);
    ctx.bezierCurveTo(
      x + l + th * 0.45, midY - tw / 3,
      x + l + th, midY - tw / 2.2,
      x + l + th, midY
    );
    ctx.bezierCurveTo(
      x + l + th, midY + tw / 2.2,
      x + l + th * 0.45, midY + tw / 3,
      x + l, midY + tw / 2
    );
    ctx.lineTo(x + l, y + l - cr);
    ctx.arcTo(x + l, y + l, x + l - cr, y + l, cr);

    // 3. SISI BAWAH: garis lurus bersih dengan sudut membulat
    ctx.lineTo(x + cr, y + l);
    ctx.arcTo(x, y + l, x, y + l - cr, cr);

    // 4. SISI KIRI: garis lurus bersih dengan sudut membulat
    ctx.lineTo(x, y + cr);
    ctx.arcTo(x, y, x + cr, y, cr);

    ctx.closePath();
  }, []);

  // Inisialisasi kanvas gambar dan potongan puzzle
  const initPuzzle = useCallback(() => {
    const currentToken = ++loadTokenRef.current;
    setIsLoadingImage(true);
    setStatus('idle');
    setSliderX(0);

    const img = new Image();
    img.src = PUZZLE_IMAGES[currentImageIndex];

    img.onload = () => {
      if (currentToken !== loadTokenRef.current) return;

      const bgCanvas = bgCanvasRef.current;
      const pieceCanvas = pieceCanvasRef.current;
      if (!bgCanvas || !pieceCanvas) return;

      const bgCtx = bgCanvas.getContext('2d');
      const pieceCtx = pieceCanvas.getContext('2d');
      if (!bgCtx || !pieceCtx) return;

      // Tentukan posisi lubang puzzle secara acak namun aman di dalam batas kanvas
      const minX = 85;
      const maxX = CANVAS_WIDTH - PIECE_SIZE - PADDING - 10;
      const minY = PADDING + 4;
      const maxY = CANVAS_HEIGHT - PIECE_SIZE - PADDING - 4;

      const randX = Math.floor(Math.random() * (maxX - minX)) + minX;
      const randY = Math.floor(Math.random() * (maxY - minY)) + minY;

      setTargetX(randX);
      setTargetY(randY);

      // 1. Gambar background gambar utama terlebih dahulu pada ukuran kanvas tampilan
      bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      bgCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Siapkan kanvas kepingan puzzle
      const pDim = PIECE_SIZE + PADDING * 2;
      pieceCanvas.width = pDim;
      pieceCanvas.height = pDim;

      pieceCtx.clearRect(0, 0, pDim, pDim);
      pieceCtx.save();
      drawPuzzlePath(pieceCtx, PADDING, PADDING);
      pieceCtx.clip();

      // PENTING: Ambil potongan gambar langsung dari bgCanvas (skala tampilan), BUKAN dari img mentah!
      pieceCtx.drawImage(
        bgCanvas,
        randX - PADDING,
        randY - PADDING,
        pDim,
        pDim,
        0,
        0,
        pDim,
        pDim
      );

      // Beri garis tepi putih pada kepingan puzzle
      pieceCtx.lineWidth = 1.5;
      pieceCtx.strokeStyle = '#ffffff';
      pieceCtx.stroke();
      pieceCtx.restore();

      // 3. Setelah kepingan diambil, baru buat lubang target gelap di bgCanvas
      bgCtx.save();
      drawPuzzlePath(bgCtx, randX, randY);
      bgCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      bgCtx.fill();
      bgCtx.lineWidth = 1.5;
      bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      bgCtx.stroke();
      bgCtx.restore();

      setIsLoadingImage(false);
    };

    img.onerror = () => {
      setIsLoadingImage(false);
    };
  }, [currentImageIndex, drawPuzzlePath]);

  useEffect(() => {
    initPuzzle();
  }, [initPuzzle]);

  // Maksimum pergeseran slider
  const maxSliderTravel = CANVAS_WIDTH - 30; // 30px adalah lebar tombol handle

  const handleDragStart = (clientX: number) => {
    if (status === 'success' || isLoadingImage) return;
    setIsDragging(true);
    setStatus('dragging');
    dragStartRef.current = {
      clientX,
      sliderX,
    };
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !dragStartRef.current) return;
      const deltaX = clientX - dragStartRef.current.clientX;
      const newX = Math.max(0, Math.min(maxSliderTravel, dragStartRef.current.sliderX + deltaX));
      setSliderX(newX);
    },
    [isDragging, maxSliderTravel]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;

    // Posisi yang tepat kepingan puzzle berada di atas lubang
    const exactMatchSliderX = targetX - START_X;
    const diff = Math.abs(sliderX - exactMatchSliderX);

    if (diff <= TOLERANCE) {
      // BERHASIL: Kunci posisi kepingan tepat di atas lubang
      setSliderX(exactMatchSliderX);
      setStatus('success');
      onSuccess();
    } else {
      // GAGAL: Beri animasi getar dan kembalikan ke awal
      setStatus('failed');
      setTimeout(() => {
        setSliderX(0);
        setStatus('idle');
      }, 500);
    }
  }, [isDragging, sliderX, targetX, onSuccess]);

  // Global mouse & touch listeners
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX);
      }
    };

    const onMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onTouchEnd = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleDragEnd]);

  const handleRefresh = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStatus('idle');
    setSliderX(0);
    setCurrentImageIndex((prev) => (prev + 1) % PUZZLE_IMAGES.length);
    if (onReset) onReset();
  };

  return (
    <div
      className={`w-full max-w-[276px] mx-auto rounded-xl border p-2 transition-colors select-none font-sans ${
        status === 'success'
          ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs'
          : 'bg-slate-50 border-slate-200 shadow-xs'
      }`}
    >
      {/* 1. Header Mungil (Tinggi tetap ~18px) */}
      <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-200/80 text-[11px] font-bold text-slate-700">
        <span className="flex items-center gap-1.5 text-[#0E4A3E]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0E4A3E]" />
          Verifikasi Keamanan
        </span>
        <button
          type="button"
          suppressHydrationWarning
          onClick={handleRefresh}
          title={status === 'success' ? 'Verifikasi Ulang' : 'Ganti Gambar Puzzle'}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
        >
          {status === 'success' ? (
            <RotateCcw className="w-3 h-3 text-emerald-700" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* 2. Area Kanvas Gambar Puzzle Mungil (Tinggi tepat 100px, lebar 260px) */}
      <div className="relative w-[260px] h-[100px] mx-auto overflow-hidden bg-slate-800 rounded-lg shadow-inner">
        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white text-[10px] z-30">
            <RefreshCw className="w-4 h-4 animate-spin mr-1.5 text-emerald-400" />
            Memuat puzzle...
          </div>
        )}

        {/* Kanvas Gambar Utama */}
        <canvas
          ref={bgCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full block"
        />

        {/* Kepingan Puzzle yang Bergerak */}
        <div
          style={{
            position: 'absolute',
            top: `${targetY - PADDING}px`,
            left: `${START_X + sliderX - PADDING}px`,
            transition: isDragging ? 'none' : 'left 0.3s ease-out',
            filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.75))',
            pointerEvents: 'none',
            zIndex: 20,
          }}
          className={status === 'failed' ? 'animate-bounce' : ''}
        >
          <canvas ref={pieceCanvasRef} />
        </div>

        {/* Status: Berhasil -> Tampilkan Overlay Centang Hijau Elegan tanpa mengubah ukuran */}
        {status === 'success' && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-30 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md mb-0.5 animate-in zoom-in-75">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <p className="text-[11px] font-extrabold text-white drop-shadow-sm leading-tight">
              Verifikasi Berhasil!
            </p>
            <span className="text-[9px] font-semibold text-emerald-200 leading-none">
              Puzzle terpasang pas
            </span>
          </div>
        )}

        {/* Status: Gagal -> Notifikasi Singkat */}
        {status === 'failed' && (
          <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center text-white text-[11px] font-bold gap-1 z-30 animate-pulse">
            <XCircle className="w-4 h-4 text-red-400" />
            Posisi belum pas, coba lagi!
          </div>
        )}

        {/* Instruksi Awal */}
        {status === 'idle' && !isLoadingImage && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs z-10 pointer-events-none">
            Geser slider untuk melengkapi puzzle
          </div>
        )}
      </div>

      {/* 3. Slider Bar Track (Tinggi tepat 30px, lebar pas 260px) */}
      <div
        ref={trackRef}
        className={`mt-2 relative w-[260px] mx-auto h-[30px] rounded-full overflow-hidden border flex items-center transition-all ${
          status === 'success'
            ? 'bg-emerald-100 border-emerald-300'
            : 'bg-slate-200 border-slate-300'
        }`}
      >
        {status === 'success' ? (
          // Slider saat Berhasil
          <div className="w-full flex items-center justify-between px-3 text-[10px] font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Terverifikasi
            </span>
            <span className="text-[9px] font-extrabold uppercase bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
              PASSED
            </span>
          </div>
        ) : (
          // Slider saat Belum Berhasil (Bisa digeser)
          <>
            {/* Indikator Bar Pengisian */}
            <div
              className={`absolute left-0 top-0 bottom-0 transition-colors pointer-events-none ${
                status === 'failed' ? 'bg-red-400/40' : 'bg-[#568E7D]/35'
              }`}
              style={{
                width: `${sliderX + 20}px`,
                transition: isDragging ? 'none' : 'width 0.3s ease-out',
              }}
            />

            {/* Teks Instruksi */}
            <div className="w-full text-center text-[10px] font-semibold text-slate-500 pointer-events-none pl-8 pr-2 truncate">
              {status === 'dragging' ? 'Lepas di posisi puzzle' : 'Geser ke kanan'}
            </div>

            {/* Handle Tombol Geser */}
            <div
              onMouseDown={(e) => handleDragStart(e.clientX)}
              onTouchStart={(e) => {
                if (e.touches.length > 0) handleDragStart(e.touches[0].clientX);
              }}
              style={{
                transform: `translateX(${sliderX}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }}
              className={`
                absolute left-0 top-0 bottom-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white shadow-sm cursor-grab active:cursor-grabbing transition-colors z-20
                ${
                  status === 'failed'
                    ? 'bg-red-600'
                    : 'bg-[#0E4A3E] hover:bg-[#165a4c]'
                }
              `}
            >
              {status === 'failed' ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
