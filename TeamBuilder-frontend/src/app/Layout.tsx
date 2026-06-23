// import React from 'react'
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1 bg-gray-50 h-screen font-sans overflow-auto">
        <NavBar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
