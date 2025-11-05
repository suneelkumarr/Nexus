import React, { useState } from 'react';
import {
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  BeakerIcon,
  ChartPieIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigation = [
  { name: 'Dashboard', icon: ChartPieIcon, id: 'dashboard', permission: 'view_tests' },
  { name: 'Active Tests', icon: BeakerIcon, id: 'tests', permission: 'view_tests' },
  { name: 'Create Test', icon: PlayIcon, id: 'create-test', permission: 'create_tests' },
  { name: 'Results & Analytics', icon: ChartBarIcon, id: 'results', permission: 'view_results' },
  { name: 'Statistical Calculator', icon: ChartBarIcon, id: 'calculator', permission: 'view_analytics' },
  { name: 'Test Scheduling', icon: CalendarIcon, id: 'schedule', permission: 'manage_tests' },
  { name: 'Data Export', icon: DocumentArrowDownIcon, id: 'export', permission: 'export_data' },
  { name: 'User Management', icon: UserGroupIcon, id: 'users', permission: 'all' },
  { name: 'Settings', icon: CogIcon, id: 'settings', permission: 'all' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">A/B Testing Suite</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ${
                  currentPage === item.id
                    ? 'bg-indigo-50 border-r-2 border-indigo-600 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6">
            <h1 className="text-xl font-bold text-gray-900">A/B Testing Suite</h1>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {filteredNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onPageChange(item.id)}
                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ${
                  currentPage === item.id
                    ? 'bg-indigo-50 border-r-2 border-indigo-600 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              {/* Page title will be set dynamically */}
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <div className="flex items-center gap-x-3">
                <div className="hidden lg:flex lg:items-center lg:gap-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden lg:block">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;