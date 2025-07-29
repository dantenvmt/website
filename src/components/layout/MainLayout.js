import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './SideNav';
import TopHeader from './TopHeader';
import Footer from './Footer';
const MainLayout = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);

    return (
        <div className="bg-black text-white font-sans antialiased flex h-screen">
            <SideNav
                isNavOpen={isNavOpen}
                setIsNavOpen={setIsNavOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader />
                <main className="flex-grow overflow-y-auto">
                    <Outlet />
                    <Footer />
                </main>

            </div>
        </div>
    );
};

export default MainLayout;