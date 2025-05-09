import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CircleUserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { isPassNotValid } from '../helpers/passwordValidation';
import Tilt from 'react-parallax-tilt';
import ThemeToggle from '../components/common/ThemeToggle';

function SignUpPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();

  useEffect(() => {
    document.title = 'Sign up - NexusChat';
  }, []);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return false;
    }

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }

    const passwordError = isPassNotValid(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return false;
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const isInputValid = validateForm();
    if (isInputValid) signup(formData, navigate);
  }

  return (
    <>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-2 p-6 sm:p-12">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <Tilt scale={1.5} transitionSpeed={1000}>
                <div className="w-32 h-30 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
                  <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-80" />
                </div>
              </Tilt>
              <h1 className="text-2xl font-bold mt-2">Sign Up</h1>
              <p className="text-base-content/60">Sign up to get your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex"><User />&nbsp;Full Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input input-bordered w-full pl-3"
                  name='fullName'
                  placeholder="Enter Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex"><User />&nbsp;Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input input-bordered w-full pl-3"
                  name='username'
                  placeholder="Enter Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex"><Mail />&nbsp;Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="input input-bordered w-full pl-3"
                  name='email'
                  placeholder="Enter E-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  name='password'
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

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex"><Lock />&nbsp;Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  className="input input-bordered w-full pl-3"
                  placeholder="Confirm Password"
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

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}><CircleUserRound />
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;