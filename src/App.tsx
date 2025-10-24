
import React, { useState, useCallback } from 'react';
import { AnalysisResult, AppState, STATUS_MESSAGES } from './types';
import { analyzeImageAndFetchHistory, generateNarration } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import { CameraIcon, SparklesIcon } from './components/Icons';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:image/jpeg;base64,...."
      // we need to remove the "data:image/jpeg;base64," part
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: 'upload',
    imageUrl: null,
    analysisResult: null,
    audioData: null,
    isLoading: false,
    statusMessage: '',
    error: null,
  });

  const handleFileUpload = useCallback(async (file: File) => {
    setAppState({
      view: 'loading',
      imageUrl: URL.createObjectURL(file),
      analysisResult: null,
      audioData: null,
      isLoading: true,
      statusMessage: STATUS_MESSAGES.ANALYZING,
      error: null,
    });

    try {
      const imageBase64 = await fileToBase64(file);
      
      const analysis = await analyzeImageAndFetchHistory(imageBase64);
      
      setAppState(prev => ({ ...prev, statusMessage: STATUS_MESSAGES.NARRATING }));
      
      const audio = await generateNarration(analysis.text);

      setAppState({
        view: 'result',
        imageUrl: URL.createObjectURL(file),
        analysisResult: analysis,
        audioData: audio,
        isLoading: false,
        statusMessage: '',
        error: null,
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setAppState({
        view: 'upload',
        imageUrl: null,
        analysisResult: null,
        audioData: null,
        isLoading: false,
        statusMessage: '',
        error: `Failed to process image. ${errorMessage}`,
      });
    }
  }, []);

  const handleReset = () => {
    if (appState.imageUrl) {
      URL.revokeObjectURL(appState.imageUrl);
    }
    setAppState({
      view: 'upload',
      imageUrl: null,
      analysisResult: null,
      audioData: null,
      isLoading: false,
      statusMessage: '',
      error: null,
    });
  };
  
  const renderContent = () => {
    switch(appState.view) {
      case 'upload':
        return <FileUpload onFileUpload={handleFileUpload} error={appState.error} />;
      case 'loading':
        return <Loader message={appState.statusMessage} imageUrl={appState.imageUrl} />;
      case 'result':
        if (appState.analysisResult && appState.imageUrl && appState.audioData) {
          return <ResultDisplay
            imageUrl={appState.imageUrl}
            result={appState.analysisResult}
            audioData={appState.audioData}
            onReset={handleReset}
          />;
        }
        // Fallback to upload if state is inconsistent
        handleReset();
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <CameraIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            Photo Tourism Guide
          </h1>
          <SparklesIcon className="w-10 h-10 text-violet-500" />
        </div>
        <p className="text-base sm:text-lg text-gray-400">
          Upload a photo of a landmark. AI will tell you its story.
        </p>
      </header>
      <main className="w-full max-w-4xl flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
