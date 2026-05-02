import { redirect } from 'next/navigation';

export default function RootPage() {
  // Langsung arahkan ke halaman login
  redirect('/login');
  
  // Return null karena halaman ini tidak akan pernah dirender
  return null;
}