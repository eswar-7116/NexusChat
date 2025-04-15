import { useState, useEffect } from 'react';
import Tilt from 'react-parallax-tilt';
import { Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2, Sun, Moon, CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();
  const { login, isLoggingIn, theme, changeTheme } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const validateForm = () => {
    if (!formData.username.trim())
      return toast.error("Username is required");

    if (!formData.password.trim())
      return toast.error("Password is required");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      login(formData, navigate);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4">
        <button 
          onClick={changeTheme}
          className="btn btn-ghost btn-circle hover:bg-base-300"
        >
          {theme === 'dark' ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-2 p-6 sm:p-12">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <Tilt scale={1.5} transitionSpeed={1000}>
                <div className="w-32 h-30 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
                  <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-80"/>
                </div>
              </Tilt>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex"><User />&nbsp;Username or Email</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input input-bordered w-full pl-3"
                  placeholder="Enter Username or Email"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex"><Lock />&nbsp;Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input input-bordered w-full pl-3"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}><CircleUserRound />
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
            
            <div className="text-center">
              <Link to="/forgot-password" className="text-primary hover:underline text-sm">
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-base-content/60">
              Don't have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;