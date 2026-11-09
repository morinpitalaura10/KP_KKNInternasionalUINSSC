'use client';

import React, { useEffect, useState } from 'react';
import { History, X, RefreshCw, User, Clock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export interface AuditLogItem {
  id_log: number;
  id_user: number;
  nama_user: string;
  email_user?: string;
  role_user: string;
  id_periode: number | null;
  nama_periode?: string | null;
  jenis: string;
  id_referensi: number | null;
  aksi: 'Publish' | 'Private' | string;
  keterangan: string | null;
  created_at: string;
}

interface LogPublikasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJenis?: 'all' | 'timeline' | 'pengumuman' | 'hasil_seleksi';
  idPeriode?: number | string | null;
}

export default function LogPublikasiModal({
  isOpen,
  onClose,
  defaultJenis = 'all',
  idPeriode = null,
}: LogPublikasiModalProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterJenis, setFilterJenis] = useState<string>(defaultJenis);

  useEffect(() => {
    if (isOpen) {
      setFilterJenis(defaultJenis);
      fetchLogs(defaultJenis);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultJenis, idPeriode]);

  const fetchLogs = async (jenisParam: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (jenisParam && jenisParam !== 'all') {
        params.set('jenis', jenisParam);
      }
      if (idPeriode && idPeriode !== 'semua') {
        params.set('id_periode', String(idPeriode));
      }
      params.set('limit', '100');

      const res = await fetch(`/api/log_publikasi?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil log publikasi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (newJenis: string) => {
    setFilterJenis(newJenis);
    fetchLogs(newJenis);
  };

  const formatDateTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const tanggal = d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const waktu = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return { tanggal, waktu };
    } catch {
      return { tanggal: isoStr, waktu: '-' };
    }
  };

  const getJenisLabel = (jenis: string) => {
    if (jenis === 'hasil_seleksi') return 'Hasil Seleksi';
    if (jenis === 'timeline') return 'Jadwal Timeline';
    if (jenis === 'pengumuman') return 'Pengumuman';
    return jenis;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0E4A3E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide">
                RIWAYAT PUBLIKASI & LOG AUDIT
              </h3>
              <p className="text-xs text-emerald-100">
                Pencatatan identitas eksekutor (user_id), tanggal, dan waktu eksekusi publikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'all', label: 'Semua Aktivitas' },
              { key: 'hasil_seleksi', label: 'Hasil Seleksi' },
              { key: 'timeline', label: 'Jadwal Timeline' },
              { key: 'pengumuman', label: 'Pengumuman' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  filterJenis === t.key
                    ? 'bg-[#0E4A3E] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchLogs(filterJenis)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0E4A3E] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0E4A3E] mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Memuat data log audit dari database...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat Publikasi</p>
              <p className="text-xs text-slate-400">
                Setiap perubahan status Publish / Private akan otomatis tercatat pada tabel log_publikasi.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Waktu Eksekusi</th>
                    <th className="py-3 px-4">Eksekutor (User ID)</th>
                    <th className="py-3 px-4">Modul</th>
                    <th className="py-3 px-4 text-center">Status Aksi</th>
                    <th className="py-3 px-4">Keterangan Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const { tanggal, waktu } = formatDateTime(log.created_at);
                    const isPublish = log.aksi === 'Publish';

                    return (
                      <tr key={log.id_log} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{tanggal}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#0E4A3E]" />
                            <span>{waktu} WIB</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <User className="w-3.5 h-3.5 text-[#0E4A3E]" />
                            <span>{log.nama_user}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            user_id: <span className="font-bold text-slate-700">#{log.id_user}</span> ({log.role_user})
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {getJenisLabel(log.jenis)}
                          </span>
                          {log.nama_periode && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                              {log.nama_periode}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isPublish ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                              <Eye className="w-3 h-3" /> Publish
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px]">
                              <EyeOff className="w-3 h-3" /> Private
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 leading-relaxed min-w-[220px]">
                          {log.keterangan || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total tercatat: <strong className="text-slate-700">{logs.length}</strong> log aktivitas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

