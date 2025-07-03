import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiHome,
  FiFileText,
  FiEdit3,
  FiUser,
  FiUsers,
  FiSettings,
  FiBarChart3
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: FiHome,
      current: location.pathname === '/admin'
    },
    {
      name: 'My Articles',
      href: '/admin/articles',
      icon: FiFileText,
      current: location.pathname.startsWith('/admin/articles')
    },
    {
      name: 'Create Article',
      href: '/admin/articles/create',
      icon: FiEdit3,
      current: location.pathname === '/admin/articles/create'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: FiUser,
      current: location.pathname === '/profile'
    },
  ];

  const adminNavigation = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: FiBarChart3,
      current: location.pathname === '/admin'
    },
    {
      name: 'Manage Users',
      href: '/admin/users',
      icon: FiUsers,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Manage Articles',
      href: '/admin/articles',
      icon: FiFileText,
      current: location.pathname === '/admin/articles'
    },
  ];

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 transition-colors
                    ${item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-6 mt-6 border-t border-gray-200">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </p>
              </div>
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${item.current
                        ? 'bg-red-100 text-red-700 border-r-2 border-red-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 transition-colors
                        ${item.current ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <FiHome className="mr-2 h-4 w-4" />
            View Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
