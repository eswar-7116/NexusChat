import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserX, Home } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const NotFoundPage = () => {
  useEffect(() => {
    document.title = 'Page Not Found - NexusChat';
  }, []);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full text-center space-y-6">
        {/* Header */}
        <div className="flex justify-center items-center gap-3 animate-bounce">
          <UserX size={48} className="text-error" />
          <h1 className="text-5xl sm:text-6xl font-bold text-base-content/90">
            404
          </h1>
        </div>

        {/* Page Not Found Message */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-base-content/80">
            Page Not Found
          </h2>

          <p className="text-sm sm:text-base text-base-content/60">
            This page seems to have wandered off. Let’s get you back to the chat!
          </p>
        </div>

        {/* Back to Chat Button */}
        <Link to="/" className="btn btn-primary btn-md sm:btn-lg gap-2 shadow-md">
          <Home size={20} />
          Back to Chat
        </Link>

        {/* Footer */}
        <p className="text-xs text-base-content/40 font-mono">
          ERROR: 404 - Lost in the Void
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;