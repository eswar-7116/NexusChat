import Tilt from 'react-parallax-tilt';

const NoUserSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <Tilt>
              <div className="w-32 h-32 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-7 scale-80 animate-bounce transform transition-transform duration-300 hover:scale-115">
                <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-120" />
              </div>
            </Tilt>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to NexusChat!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoUserSelected;