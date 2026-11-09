import { NextRequest, NextResponse } from 'next/server';
import { getLogPublikasiList } from '@/lib/publikasi';

// GET /api/log_publikasi?id_periode=&jenis=&limit=
// Mengambil riwayat publikasi (log audit) meliputi user_id, nama user, jenis, aksi, tanggal & waktu eksekusi.
export async function GET(req: NextRequest) {
  try {
    const userRole = req.cookies.get('user_role')?.value;
    if (userRole && userRole !== 'admin' && userRole !== 'staff') {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idPeriodeParam = searchParams.get('id_periode');
    const jenis = searchParams.get('jenis');
    const limitParam = searchParams.get('limit');

    const id_periode = idPeriodeParam ? parseInt(idPeriodeParam, 10) : null;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const logs = await getLogPublikasiList({
      id_periode: id_periode && !isNaN(id_periode) ? id_periode : null,
      jenis: jenis || null,
      limit: limit && !isNaN(limit) ? limit : 50,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching log publikasi:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil riwayat publikasi' }, { status: 500 });
  }
}
