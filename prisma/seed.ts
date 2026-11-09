import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding data awal ke 23 tabel MySQL...');

  // 1. Users
  const userMhs = await prisma.user.upsert({
    where: { email: 'morin.laura@syekhnurjati.ac.id' },
    update: {},
    create: {
      nim: '2108107001',
      nama: 'Morin Pita Laura',
      email: 'morin.laura@syekhnurjati.ac.id',
      password: 'mhs123',
      role: 'mahasiswa',
      status: true,
    },
  });

  const userStaff = await prisma.user.upsert({
    where: { email: 'ahmad.fauzi@syekhnurjati.ac.id' },
    update: {},
    create: {
      nama: 'Dr. H. Ahmad Fauzi, M.Pd.',
      email: 'ahmad.fauzi@syekhnurjati.ac.id',
      password: 'staff123',
      role: 'staff',
      status: true,
    },
  });

  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin.kkn@syekhnurjati.ac.id' },
    update: {},
    create: {
      nama: 'Super Administrator LP2M',
      email: 'admin.kkn@syekhnurjati.ac.id',
      password: 'admin123',
      role: 'admin',
      status: true,
    },
  });

  console.log('✅ Users (Mahasiswa, Staff, Admin) dibuat.');

  // 2. Staff
  await prisma.staff.upsert({
    where: { id_user: userStaff.id_user },
    update: {},
    create: {
      id_user: userStaff.id_user,
      nip: '198503152010121002',
      no_hp: '081234567890',
      status: true,
    },
  });
  console.log('✅ Data Staff dibuat.');

  // 3. Fakultas
  let fakultasFitk = await prisma.fakultas.findFirst({ where: { nama_fakultas: 'FITK' } });
  if (!fakultasFitk) {
    fakultasFitk = await prisma.fakultas.create({
      data: {
        nama_fakultas: 'FITK',
        status: true,
      },
    });
  }

  await prisma.fakultas.createMany({
    data: [
      { nama_fakultas: 'FUA', status: true },
      { nama_fakultas: 'FEBI', status: true },
      { nama_fakultas: 'FASYA', status: true },
      { nama_fakultas: 'FDKI', status: true },
      { nama_fakultas: 'FASTIH', status: true },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Fakultas dibuat.');

  // 4. Prodi
  let prodiTbi = await prisma.prodi.findFirst({ where: { nama_prodi: 'Tadris Bahasa Inggris' } });
  if (!prodiTbi) {
    prodiTbi = await prisma.prodi.create({
      data: {
        id_fakultas: fakultasFitk.id_fakultas,
        nama_prodi: 'Tadris Bahasa Inggris',
        status: true,
      },
    });
  }
  console.log('✅ Prodi dibuat.');

  // 5. Mahasiswa
  await prisma.mahasiswa.upsert({
    where: { id_user: userMhs.id_user },
    update: {},
    create: {
      id_user: userMhs.id_user,
      id_fakultas: fakultasFitk.id_fakultas,
      id_prodi: prodiTbi.id_prodi,
      ipk: 3.75,
      semester: 7,
      kelas: 'TBI-7A',
    },
  });
  console.log('✅ Data Mahasiswa dibuat.');

  // 6. Periode
  let periodeAktif = await prisma.periode.findFirst({ where: { nama_periode: 'KKN Internasional Gelombang 1' } });
  if (!periodeAktif) {
    periodeAktif = await prisma.periode.create({
      data: {
        nama_periode: 'KKN Internasional Gelombang 1',
        tahun: 2026,
        tanggal_mulai: new Date('2026-10-01'),
        tanggal_selesai: new Date('2026-10-31'),
        kuota: 10,
        status: 'Aktif',
      },
    });
  }

  const existingP2 = await prisma.periode.findFirst({ where: { nama_periode: 'KKN Internasional Gelombang 2' } });
  if (!existingP2) {
    await prisma.periode.create({
      data: {
        nama_periode: 'KKN Internasional Gelombang 2',
        tahun: 2026,
        tanggal_mulai: new Date('2026-11-01'),
        tanggal_selesai: new Date('2026-11-15'),
        kuota: 40,
        status: 'Belum_Aktif',
      },
    });
  }

  const existingPK = await prisma.periode.findFirst({ where: { nama_periode: 'KKN Internasional Pra-Khusus' } });
  if (!existingPK) {
    await prisma.periode.create({
      data: {
        nama_periode: 'KKN Internasional Pra-Khusus',
        tahun: 2025,
        tanggal_mulai: new Date('2025-06-01'),
        tanggal_selesai: new Date('2025-07-30'),
        kuota: 30,
        status: 'Selesai',
      },
    });
  }
  console.log('✅ Periode dibuat.');

  // 7. Negara
  let negaraMalaysia = await prisma.negara.findFirst({ where: { nama_negara: 'Malaysia' } });
  if (!negaraMalaysia) {
    negaraMalaysia = await prisma.negara.create({
      data: { nama_negara: 'Malaysia', status: true },
    });
  }

  let negaraThailand = await prisma.negara.findFirst({ where: { nama_negara: 'Thailand' } });
  if (!negaraThailand) {
    negaraThailand = await prisma.negara.create({
      data: { nama_negara: 'Thailand', status: true },
    });
  }

  await prisma.negara.createMany({
    data: [
      { nama_negara: 'Filipina', status: true },
      { nama_negara: 'Brunei Darussalam', status: true },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Negara dibuat.');

  // 8. Periode Negara
  const countPN = await prisma.periode_negara.count();
  if (countPN === 0) {
    await prisma.periode_negara.createMany({
      data: [
        { id_periode: periodeAktif.id_periode, id_negara: negaraMalaysia.id_negara, status: true },
        { id_periode: periodeAktif.id_periode, id_negara: negaraThailand.id_negara, status: true },
      ],
    });
  }
  console.log('✅ Periode Negara dibuat.');

  // 9. Informasi
  const countInfo = await prisma.informasi.count();
  if (countInfo === 0) {
    await prisma.informasi.create({
      data: {
        id_periode: periodeAktif.id_periode,
        id_user: userAdmin.id_user,
        judul: 'Tentang KKN Internasional',
        isi: 'KKN Internasional adalah program pengabdian kepada masyarakat yang dilaksanakan oleh mahasiswa UINSSC di luar negeri, dengan tujuan meningkatkan kompetensi, wawasan global, serta memberikan kontribusi nyata bagi masyarakat di lokasi penempatan.',
        status: true,
      },
    });
  }
  console.log('✅ Informasi dibuat.');

  console.log('🎉 Seeding seluruh data dasar BERHASIL!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
