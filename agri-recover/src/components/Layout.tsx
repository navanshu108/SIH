import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, LayoutDashboard, FilePlus, History, Info } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/assessment', icon: FilePlus, label: 'New Assessment' },
    { to: '/history', icon: History, label: 'History' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-agri-900 text-white flex flex-col no-print">
        <div className="p-6 flex items-center gap-3 border-b border-agri-700">
          <Sprout className="w-8 h-8 text-agri-500" />
          <div>
            <h1 className="text-xl font-bold">AgriRecover</h1>
            <p className="text-xs text-agri-100 opacity-80">Decision Support</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${loc.pathname === l.to ? 'bg-agri-700 text-white' : 'text-agri-100 hover:bg-agri-800'}`}>
              <l.icon className="w-5 h-5" />
              <span className="font-medium">{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 text-xs text-agri-100/50">Educational purpose only.</div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};