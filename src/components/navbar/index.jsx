import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import { FaShieldAlt } from "react-icons/fa";

const Navbar = (props) => {
  const { brandText } = props;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { path: "/library-test", text: "라이브러리 테스트" },
    { path: "/vulnerability", text: "취약점 분석" },
    { path: "/packet-monitor", text: "패킷 모니터링" },
    { path: "/reports", text: "분석 리포트" },
  ];

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-16 w-full border-b border-gray-200 flex items-center justify-between px-6 shadow-md">
        {/* Logo and Menu */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="flex items-center space-x-3 font-bold hover:text-red-600"
          >
            <FaShieldAlt className="h-7 w-7 text-red-600" />
            <div className="flex flex-col">
              <p className="text-xl font-bold text-gray-800">File Security Platform</p>
              <p className="text-sm text-gray-600">by Security Group MOBYDICK</p>
            </div>
          </Link>

          {/* Menu Items */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base font-semibold capitalize hover:text-red-600 transition-colors ${
                  brandText === item.text ? "text-red-600" : "text-gray-700"
                }`}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex items-center space-x-4">
          {/* Documentation Button */}
          <div className="hidden md:block">
            <button className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 text-sm font-semibold transition-colors border border-gray-200">
              문서
            </button>
          </div>

          {/* Start Test Button */}
          <div className="hidden md:block">
            <button className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors">
              테스트 시작
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-red-600"
            onClick={toggleSidebar}
          >
            <RiMenuLine className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden shadow-lg`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Top Section */}
          <div className="p-6">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center space-x-2">
                <FaShieldAlt className="h-7 w-7 text-red-600" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-800">File Security</span>
                  <span className="text-sm text-gray-600">by MOBIDIC</span>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <RiCloseLine className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-lg font-semibold text-base transition-colors ${
                    brandText === item.text
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={toggleSidebar}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto p-6 border-t border-gray-200 space-y-3">
            <button className="w-full bg-gray-100 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-200 text-sm font-semibold transition-colors border border-gray-200">
              문서
            </button>
            <button className="w-full bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors">
              테스트 시작
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;