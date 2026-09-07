export interface Frame {
  id: string;
  title: string;
  description: string;
  currentRevisionId: string;
}

export interface Revision {
  id: string;
  frameId: string;
  label: string;
  imageUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface Annotation {
  id: string;
  frameId: string;
  revisionId: string;
  x: number;
  y: number;
  body: string;
  resolved: boolean;
  createdAt: string;
}

export interface ReviewDetail {
  frame: Frame;
  revision: Revision;
  revisions: Revision[];
  annotations: Annotation[];
}

export interface LayoutSuggestion {
  label: string;
  body: string;
  sourceX: number;
  sourceY: number;
}
