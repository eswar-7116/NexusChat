import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, Sun, Moon, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { theme, changeTheme, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const { id, token } = useParams();

  useEffect(() => {
    document.title = 'Reset Password - NexusChat';
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Validate token and id existence
    if (!token || !id) {
      toast.error("Invalid reset link");
      navigate('/login');
    }
  }, [theme, token, id, navigate]);

  const validateForm = () => {
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      if (resetPassword(id, formData.password, token)) {
        setResetComplete(true);
      }
    } catch (error) {
      console.error("Failed to reset password: ", error.message);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <div className="mb-4">
            <Link to="/login" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-30 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
                <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-80"/>
              </div>
              <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
              <p className="text-base-content/60">
                {resetComplete 
                  ? "Your password has been reset successfully" 
                  : "Create a new password for your account"}
              </p>
            </div>
          </div>

          {!resetComplete ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter new password"
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
                <label className="label">
                  <span className="label-text-alt">Password must be at least 8 characters</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="alert alert-success flex items-center gap-2">
                <Check className="size-5" />
                <p>Password reset successful!</p>
              </div>
              
              <Link to="/login" className="btn btn-primary w-full">
                Sign in with new password
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ResetPasswordPage;