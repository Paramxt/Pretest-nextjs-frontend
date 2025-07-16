'use client';

import React from 'react';
import { Home, LayoutDashboard, LogOut } from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
  onSelectPage: (index: number) => void;
  selectedIndex: number;
}

const TopBar = ({ onLogout, onSelectPage, selectedIndex }: TopBarProps) => {
  const menuItems = [
    { name: 'Home', icon: Home, index: 0 },
    { name: 'Dashboard', icon: LayoutDashboard, index: 1 },
  ];

  return (
    <nav className="bg-white p-4 shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex shrink-0">
            <a aria-current="page" className="flex items-center" href="/">
              <p className="sr-only">Website Title</p>
              <span className="ml-3 text-gray-900 text-2xl font-bold">PreTestXenosoft</span>
            </a>
          </div>

          <div className="hidden md:flex md:items-center md:justify-center md:gap-5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.index}
                  onClick={() => onSelectPage(item.index)}
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-base font-medium transition-all duration-200 w-full text-center
                ${selectedIndex === item.index
                      ? 'bg-amber-500 text-white font-semibold hover:bg-amber-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                focus:outline-none focus:ring-2 focus:ring-amber-900 focus:ring-opacity-50
              `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-xl bg-red-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-600"
            >
              <LogOut className="w-5 h-5 mr-1" />
              ออกจากระบบ
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;