'use client';

import React, { useState } from 'react';
import Layout from '../../../components/layout';
import Sidebar from '../../../components/Sidebar';
import MainPage from '../main/page';
import DashboardPage from '../dashboard/page';
    
const Page = () => {
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_access_token');
         console.log('Logged out and token removed.');
        window.location.href = '/';
    };

    const handlePageSelect = (index: number) => {
        setSelectedPageIndex(index);
    };

    let contentComponent;
    if (selectedPageIndex === 0) {
        contentComponent = <MainPage />;
    } else if (selectedPageIndex === 1) {
        contentComponent = <DashboardPage />;
    } else {
        contentComponent = <MainPage />;
    }

    return (
        <div className="flex">
            <Sidebar
                onLogout={handleLogout}
                selectedIndex={selectedPageIndex}
                onSelectPage={handlePageSelect}
            />
            <div className="flex-1 ml-64">
                <Layout>
                    {contentComponent}
                </Layout>
            </div>
        </div>
    );
};

export default Page;
