
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  landmarkName: string;
  text: string;
  sources: GroundingSource[];
}

export type AppView = 'upload' | 'loading' | 'result';

export interface AppState {
  view: AppView;
  imageUrl: string | null;
  analysisResult: AnalysisResult | null;
  audioData: string | null;
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
}

export const STATUS_MESSAGES = {
  ANALYZING: 'Identifying landmark and fetching history...',
  NARRATING: 'Creating your audio guide...',
  PLAYING: 'Playing audio guide...',
};
