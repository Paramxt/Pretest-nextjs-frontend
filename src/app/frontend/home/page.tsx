'use client';

import React, { useState } from 'react';
import Layout from '../../../../components/layout';
import TopBar from '../../../../components/TopBar';
import MainPage from '../main/page';
import DashboardPage from '../dashboard/page';

const Page = () => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('user_access_token');
    window.location.href = '/frontend/';
  };

  const handlePageSelect = (index: number) => {
    setSelectedPageIndex(index);
  };

  let contentComponent;
  switch (selectedPageIndex) {
    case 0:
      contentComponent = <MainPage />;
      break;
    case 1:
      contentComponent = <DashboardPage />;
      break;
    default:
      contentComponent = <MainPage />;
      break;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <TopBar
        onLogout={handleLogout}
        selectedIndex={selectedPageIndex}
        onSelectPage={handlePageSelect}
      />
          {contentComponent}
    </div>
  );
};

export default Page;

