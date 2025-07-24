import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Renders the child route's element
import SideNav from './SideNav';
import TopHeader from './TopHeader';

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
                    {/* Child routes will be rendered here */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;