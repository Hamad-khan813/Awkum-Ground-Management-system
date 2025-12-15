import React from 'react';
import { User, Role } from '../types';
import { db } from '../services/db';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    db.auth.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-indigo-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-white text-xl font-bold">UniSportsBook</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* Navigation Links can go here */}
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-xs text-indigo-200">{user.role === Role.ADMIN ? 'Administrator' : `Student | ${user.id}`}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">© 2024 University Sports Ground Management System</p>
        </div>
      </footer>
    </div>
  );
};