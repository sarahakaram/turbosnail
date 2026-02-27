'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🌿' },
  { href: '/profile', label: 'Profile', icon: '🪪' },
  { href: '/team', label: 'Team', icon: '🌱' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-earth-100">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-bold text-earth-900 font-serif hidden sm:inline">Wild Growth</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-forest-50 text-forest-700 font-medium'
                  : 'text-earth-600 hover:bg-earth-100'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 text-earth-400 hover:text-earth-600 text-sm px-2 py-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
