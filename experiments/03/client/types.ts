export type { Annotation, Frame, LayoutSuggestion, ReviewDetail, Revision } from '../server/types';

export interface Point {
  x: number;
  y: number;
}

export interface DraftPin extends Point {
  body: string;
}
