import { useState, useEffect, useRef } from 'react';
import { KeyRound, LogOut, ArrowLeft, Sun, Moon, UserRoundPen, Volume2, VolumeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { replyNotification } from '../../stores/chatStore';
import Tilt from 'react-parallax-tilt';
import ThemeToggle from '../common/ThemeToggle';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { logout, user, canVibrate, toggleVibration } = useAuthStore();
  const [notificationVolume, setNotificationVolume] = useState(Number(localStorage.getItem('notificationVolume')));
  const [isDragging, setIsDragging] = useState(false);

  const playReplyNotification = (newVolume) => {
    replyNotification.volume = newVolume;
    replyNotification.play();
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setNotificationVolume(newVolume);
    setIsDragging(true);
  };

  const handleVolumeDragEnd = () => {
    if (isDragging) {
      playReplyNotification(notificationVolume);
      localStorage.setItem('notificationVolume', notificationVolume);
      setIsDragging(false);
    }
  };

  const handleVolumeKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      const newVolume = Math.min(1, notificationVolume + 0.1);
      setNotificationVolume(newVolume);
      playReplyNotification(newVolume);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      const newVolume = Math.max(0, notificationVolume - 0.1);
      setNotificationVolume(newVolume);
      playReplyNotification(newVolume);
    }
  };

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
            <Tilt scale={1.1} transitionSpeed={1000}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-3 sm:p-4">
                <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="w-full h-full object-contain" />
              </div>
            </Tilt>
            <span className="text-lg sm:text-xl font-bold ml-1 sm:ml-2">NexusChat</span>
          </>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="transform transition-transform duration-150 cursor-pointer hover:scale-110 flex items-center gap-1 m-1 sm:m-2 text-xs sm:text-sm font-medium opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
        )}
      </div>

      <div className="relative flex items-center" ref={dropdownRef}>
        <ThemeToggle />

        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 sm:gap-2 hover:bg-base-300 p-1 sm:p-2 rounded-lg ml-1 sm:ml-2 transform transition-all duration-200 hover:scale-105"
        >
          <img
            src={user.profilePic || "/profile.png"}
            alt="Profile"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
          />
          <span className="hidden sm:inline text-md font-semibold">{user.fullName}</span>
          <span className="sm:hidden text-xs truncate max-w-20">
            {user.fullName.split(' ')[0]}
          </span>
        </button>

        {isDropdownOpen && (
          <ul className="menu dropdown-content z-[100] absolute top-full right-0 p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-200 space-y-1">
            <li>
              <button onClick={handleEditProfile} className="flex items-center hover:bg-base-200 transform transition-transform duration-200 hover:scale-103">
                <UserRoundPen className="size-4 mr-2" />
                Change Profile Pic
              </button>
            </li>
            <li>
              <button onClick={handleChangePassword} className="flex items-center hover:bg-base-200 transform transition-transform duration-200 hover:scale-103">
                <KeyRound className="size-4 mr-2" />
                Change Password
              </button>
            </li>
            <li>
              <div className="flex items-center gap-2 hover:bg-base-200 p-2 transform transition-transform duration-200 hover:scale-103">
                {(notificationVolume > 0) && <Volume2 className="size-4 shrink-0" onClick={
                  () => {
                    handleVolumeChange({
                      target: {
                        value: notificationVolume > 0 ? 0 :
                          notificationVolume === 0 ? 1 : notificationVolume
                      }
                    });
                  }
                } />}
                {(notificationVolume === 0) && <VolumeOff className="size-4 shrink-0" onClick={
                  () => {
                    handleVolumeChange({
                      target: {
                        value: notificationVolume > 0 ? 0 :
                          notificationVolume === 0 ? 1 : notificationVolume
                      }
                    });
                  }
                } />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={notificationVolume}
                  onChange={handleVolumeChange}
                  onMouseUp={handleVolumeDragEnd}
                  onTouchEnd={handleVolumeDragEnd}
                  className="range range-primary range-xs flex-1"
                  onKeyDown={handleVolumeKeyDown}
                />
                <span className="text-xs w-8 text-center">{Math.round(notificationVolume * 100)}%</span>
              </div>
            </li>
            <li>
              <label className="flex items-center hover:bg-base-200 p-2 transform transition-transform duration-200 hover:scale-103">
                <input
                  type="checkbox"
                  checked={canVibrate}
                  onChange={toggleVibration}
                  className="toggle toggle-primary toggle-sm mr-2"
                />
                Vibration
              </label>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center text-error hover:bg-error hover:bg-opacity-10 hover:text-error-content transform transition-transform duration-200 hover:scale-103"
              >
                <LogOut className="size-4 mr-2" />
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