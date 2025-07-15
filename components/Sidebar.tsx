'use client';
import React from 'react';
import { Home, LayoutDashboard, User, LogOut } from 'lucide-react';

interface SidebarProps {
    onLogout: () => void;

    selectedIndex: number;
    onSelectPage: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, selectedIndex, onSelectPage }) => {
    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg flex flex-col justify-between z-50">
            <div>
                <div className="p-6 border-b">
                    <span className="text-2xl font-bold text-blue-700">PreTestXenosoft</span>
                </div>
                <nav className="mt-6 flex flex-col gap-2">
                    <button
                        onClick={() => onSelectPage(0)}
                        className={`px-6 py-3 flex items-center gap-2 rounded transition w-full text-left
                            ${selectedIndex === 0 ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}`
                        }
                    >
                        <Home className="w-5 h-5" />
                        หน้า Home
                    </button>
                    <button
                        onClick={() => onSelectPage(1)}
                        className={`px-6 py-3 flex items-center gap-2 rounded transition w-full text-left
                            ${selectedIndex === 1 ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        หน้าแดชบอร์ด
                    </button>
                </nav>
            </div>
            <div className="mb-6 px-6">
                <div className="flex flex-col gap-2">

                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
