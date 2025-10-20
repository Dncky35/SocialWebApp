const LoadingComponent: React.FC = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-b from-slate-950 via-cyan-950 to-violet-900 animate-pulse">
        <div className="text-center">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-violet-500 rounded-full animate-spin mx-auto shadow-lg shadow-cyan-600/50"></div>

          {/* Optional loading text */}
          {/* <p className="mt-4 text-gray-200 font-medium animate-pulse">Loading...</p> */}
        </div>
      </div>
    </div>
  );
};

export default LoadingComponent;
