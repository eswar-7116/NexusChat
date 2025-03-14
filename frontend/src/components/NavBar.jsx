import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, LogOut, ArrowLeft, Sun, Moon, UserRoundPen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user, theme, changeTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(navigate);
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    setIsDropdownOpen(false);
    navigate('/change-pass');
  };

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    navigate('/edit-profile');
  };

  return (
    <nav className="flex justify-between items-center p-1 shadow-sm">
      <div className="flex items-center">
        {location.pathname === '/' ? (
          <>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-3 sm:p-4">
              <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg sm:text-xl font-bold ml-1 sm:ml-2">NexusChat</span>
          </>
        ) : (
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 m-1 sm:m-2 text-xs sm:text-sm font-medium opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
        )}
      </div>
      
      <div className="relative flex items-center" ref={dropdownRef}>
        <button 
          onClick={changeTheme}
          className="p-2 hover:bg-base-300 rounded-full"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? (
            <Sun className="size-4 sm:size-5" />
          ) : (
            <Moon className="size-4 sm:size-5" />
          )}
        </button>
        
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 sm:gap-2 hover:bg-base-300 p-1 sm:p-2 rounded-lg ml-1 sm:ml-2"
        >
          <img 
            src={user.profilePic || "/profile.png"} 
            alt="Profile" 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
          />
          <span className="hidden sm:inline text-sm">{user.fullName}</span>
          <span className="sm:hidden text-xs truncate max-w-20">
            {user.fullName.split(' ')[0]}
          </span>
        </button>

        {isDropdownOpen && (
          <ul className="menu dropdown-content z-10 absolute right-0 top-full mt-1 w-40 sm:w-48 bg-base-100 rounded-lg shadow-lg p-1 sm:p-2 border border-base-300 text-sm">
            <li>
              <button onClick={handleEditProfile} className="flex items-center p-2 gap-2">
                <UserRoundPen className="size-4" />
                <span className="truncate">Change Profile Pic</span>
              </button>
            </li>
            <li>
              <button onClick={handleChangePassword} className="flex items-center p-2 gap-2">
                <KeyRound className="size-4" />
                <span>Change Password</span>
              </button>
            </li>
            <li>
              <button 
                onClick={handleLogout} 
                className="flex items-center p-2 gap-2 text-error hover:bg-error hover:bg-opacity-10"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;