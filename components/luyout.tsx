import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function BackGroudApp({ children }: LayoutProps) {
  const layoutClasses = "min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8";

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  );
}

export function InputForm({ children }: LayoutProps) {
  const layoutClasses = "appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg";

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  );
}