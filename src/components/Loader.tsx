
import React from 'react';

interface LoaderProps {
  message: string;
  imageUrl: string | null;
}

const Loader: React.FC<LoaderProps> = ({ message, imageUrl }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-2xl shadow-xl animate-fade-in">
       {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Processing" 
          className="w-48 h-48 object-cover rounded-xl mb-6 shadow-lg border-2 border-gray-700"
        />
      )}
      <svg
        className="animate-spin h-12 w-12 text-cyan-400 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="text-lg font-medium text-gray-200">{message}</p>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
