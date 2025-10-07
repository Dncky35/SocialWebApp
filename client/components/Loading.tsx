const LoadingComponent:React.FC = () => {

    return(
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-950 to-slate-700 animate-pulse w-full">
                <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    {/* <p className="mt-4 text-slate-700 font-medium">Loading</p> */}
                </div>
            </div>
        </div>
        
    );
};

export default LoadingComponent;