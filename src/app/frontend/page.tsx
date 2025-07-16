'use client';

import React, { useEffect, useState } from 'react';
import LoginPage from '../frontend/login/page';
import RegisterPage from './register/page';
import TopBarLogin from '../../../components/TopBarLogin';
import { useSearchParams } from 'next/navigation';


const FrontPage: React.FC = () => {

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('show') === 'login') {
      setSelectedPageIndex(0);
    }
  }, [searchParams]);
  
  const handlePageSelect = (index: number) => {
    setSelectedPageIndex(index);
  };

  let contentComponent;
  switch (selectedPageIndex) {
    case 0:
      contentComponent = <LoginPage />;
      break;
    case 1:
      contentComponent = <RegisterPage />;
      break;
    default:
      contentComponent = <LoginPage />;
      break;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <TopBarLogin
        selectedIndex={selectedPageIndex}
        onSelectPage={handlePageSelect}
      />
      <div className="flex-1">
          {contentComponent}
      </div>
    </div>
  );
};

export default FrontPage;
