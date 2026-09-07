export type Profile = 'normal' | 'slow' | 'fast' | 'failure';
export type RunStatus = 'running' | 'succeeded' | 'failed';

export interface Evidence {
  id: string;
  label: string;
  text: string;
  region: string;
}

export interface CaptureSummary {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  imageUrl: string;
  category: string;
  capturedAt: string;
  evidenceCount: number;
}

export interface Capture extends CaptureSummary {
  evidence: Evidence[];
}

export interface Finding {
  id: string;
  title: string;
  body: string;
  evidenceIds: string[];
}

export interface Report {
  summary: string;
  findings: Finding[];
}

export interface Run {
  id: string;
  captureId: string;
  question: string;
  profile: Profile;
  status: RunStatus;
  report: Report | null;
  error: string | null;
  requestedAt: string;
  completedAt: string | null;
}

export interface CaptureDetail {
  capture: Capture;
  latestRun: Run | null;
  publishedRun: Run | null;
}

export interface AnalysisInput {
  capture: Capture;
  question: string;
  profile: Profile;
}

export type AnalysisProvider = (input: AnalysisInput) => Promise<Report>;
