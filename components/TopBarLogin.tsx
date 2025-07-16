'use client';

import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface TopBarProps {
  onSelectPage: (index: number) => void;
  selectedIndex: number;
}

const TopBarLogin = ({ onSelectPage, selectedIndex }: TopBarProps) => {
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
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onSelectPage(1)}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-amber-600"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              สมัครสมาชิค
            </button>
            <button
              onClick={() => onSelectPage(0)}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-amber-600"
            >
              <LogIn className="w-4 h-4 mr-1" />
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBarLogin;