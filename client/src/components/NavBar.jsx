import React, { useState } from 'react';
import { MoreVertical, KeyRound, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    setIsDropdownOpen(false);
    navigate('/change-pass');
  };

  return (
    <nav className="flex justify-between items-center p-1 shadow-sm">
      <div className='flex items-center'>
        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
          <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-120"/>
        </div>
        <span className="text-xl font-bold">NexusChat</span>
      </div>      
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="btn btn-ghost hover:bg-base-300 m-2"
        >
          <User />
          <span>{user.fullName}</span>
        </button>

        {isDropdownOpen && (
          <ul className="menu dropdown-content z-[1] absolute right-0 mt-2 w-48 bg-base-100 rounded-box shadow-lg p-2">
            <li>
              <button onClick={handleChangePassword} className="flex items-center">
                <KeyRound className="size-5" />
                Change Password
              </button>
            </li>
            <li>
              <button 
                onClick={handleLogout} 
                className="flex items-center text-error hover:bg-error hover:text-error-content"
              >
                <LogOut className="size-5" />
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;