
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { PlayIcon, PauseIcon, ArrowPathIcon, LinkIcon } from './Icons';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface ResultDisplayProps {
  imageUrl: string;
  result: AnalysisResult;
  audioData: string;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, result, audioData, onReset }) => {
  const { isPlaying, togglePlayPause } = useAudioPlayer(audioData);

  return (
    <div className="w-full h-full bg-gray-800/50 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col md:flex-row gap-6 animate-fade-in">
      <div className="w-full md:w-1/2 flex-shrink-0">
        <img src={imageUrl} alt="Uploaded landmark" className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-lg" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col">
        <div className="flex-grow flex flex-col min-h-0">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePlayPause}
              className="flex-shrink-0 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
              aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            >
              {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">{result.landmarkName}</h2>
              <p className="text-sm text-gray-400">Your AI-powered audio guide</p>
            </div>
          </div>
          
          <div className="flex-grow prose prose-invert prose-sm sm:prose-base text-gray-300 overflow-y-auto pr-2 bg-gray-900/50 p-4 rounded-lg custom-scrollbar">
            <p>{result.text}</p>
          </div>

          <div className="mt-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Sources</h3>
            <div className="max-h-24 overflow-y-auto custom-scrollbar">
              <ul className="space-y-1">
                {result.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={onReset}
          className="mt-6 flex-shrink-0 w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-violet-500"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Analyze Another Photo
        </button>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(134, 239, 172, 0.3);
          border-radius: 20px;
          border: 3px solid transparent;
        }
        .prose {
          max-width: none;
        }
      `}</style>
    </div>
  );
};

export default ResultDisplay;
