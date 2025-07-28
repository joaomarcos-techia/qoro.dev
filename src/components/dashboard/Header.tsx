'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronDown,
  CreditCard,
  Database,
  Gift,
  Key,
  LogOut,
  RefreshCw,
  Save,
  Settings,
  User,
  Webhook,
  X,
} from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menu: string) => {
    setMenuOpen(prev => (prev === menu ? null : menu));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="bg-white shadow-neumorphism border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-black">Qoro</h1>
          </div>

          <div ref={menuRef} className="flex items-center space-x-4">
            <button
              className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300 hidden md:flex"
              title="Recarregar página"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => toggleMenu('notifications')}
                className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {menuOpen === 'notifications' && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-neumorphism border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notificações
                      </h3>
                      <button
                        onClick={() => setMenuOpen(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Notification items */}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleMenu('settings')}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300 hidden md:flex"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </button>

              {menuOpen === 'settings' && (
                <div className="hidden md:block absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-neumorphism border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Configurações
                      </h3>
                      <button
                        onClick={() => setMenuOpen(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Save className="w-3 h-3 mr-1" />
                      Configurações salvas automaticamente
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleMenu('user')}
                className="flex items-center text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                title="Menu do usuário"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {menuOpen === 'user' && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-neumorphism border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Usuário</p>
                        <p className="text-sm text-gray-600">email@qoro.com</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                      <User className="w-4 h-4 mr-3" />
                      Configurações de Perfil
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
