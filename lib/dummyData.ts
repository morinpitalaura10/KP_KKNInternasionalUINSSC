export type Role = 'mahasiswa' | 'staff' | 'admin';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash?: string;
  name: string;
  role: Role;
  identifier: string; // NIM or NIP
  email: string;
  department?: string; // Prodi or Unit
  faculty?: string;
  avatarUrl?: string;
  status: string;
}
