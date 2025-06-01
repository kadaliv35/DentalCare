import { Bell, HelpCircle, LogOut, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
      {/* Left: Menu button (mobile) and Logo */}
      <div className="flex items-center">
        <button
          type="button"
          className="mr-4 rounded-md p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center">
          <span className="text-lg font-bold text-primary-600">DentalCare</span>
        </div>
      </div>

      {/* Right: User menu, notifications, etc. */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="rounded-full p-1 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          
          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <div className="border-b border-neutral-200 px-4 py-2">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                {/* Notification items */}
                <div className="max-h-60 overflow-y-auto">
                  <div className="border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50">
                    <p className="text-sm font-medium">New appointment scheduled</p>
                    <p className="text-xs text-neutral-500">Jessica Miller - Today at 10:00 AM</p>
                  </div>
                  <div className="border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50">
                    <p className="text-sm font-medium">Appointment rescheduled</p>
                    <p className="text-xs text-neutral-500">David Wilson - Yesterday at 3:45 PM</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-neutral-50">
                    <p className="text-sm font-medium">New patient registered</p>
                    <p className="text-xs text-neutral-500">Emily Taylor - 2 days ago</p>
                  </div>
                </div>
                <div className="border-t border-neutral-200 px-4 py-2 text-center">
                  <button className="text-xs font-medium text-primary-500 hover:text-primary-600">
                    View all notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          type="button"
          className="rounded-full p-1 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <span className="sr-only">Help</span>
          <HelpCircle className="h-6 w-6" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <span className="sr-only">Open user menu</span>
            {user?.avatar ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <User className="h-5 w-5" />
              </div>
            )}
          </button>
          
          {/* User dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="border-b border-neutral-200 px-4 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                Your Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                Settings
              </a>
              <button
                onClick={logout}
                className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;