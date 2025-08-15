const LoadingComponent:React.FC = () => {
    // return (  
    //     <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
    //         <div className="rounded-lg shadow-lg p-6 max-w-xl text-center text-2xl font-semibold text-emerald-900 flex items-center space-x-4">
    //         <svg
    //             className="animate-spin h-6 w-6 text-emerald-600"
    //             xmlns="http://www.w3.org/2000/svg"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //         >
    //             <circle
    //             className="opacity-25"
    //             cx="12"
    //             cy="12"
    //             r="10"
    //             stroke="currentColor"
    //             strokeWidth="4"
    //             />
    //             <path
    //             className="opacity-75"
    //             fill="currentColor"
    //             d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    //             />
    //         </svg>
    //         </div>
    //     </div>
    // );

    return(
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="flex items-center justify-center h-screen bg-emerald-950 animate-pulse w-full">
                <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-emerald-700 font-medium">Loading</p>
                </div>
            </div>
        </div>
        
    );
};

export default LoadingComponent;