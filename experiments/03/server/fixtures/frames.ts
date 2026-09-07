import type { Annotation, Frame, Revision } from '../types';

export const frames: Frame[] = [
  {
    id: 'checkout', title: 'Checkout', currentRevisionId: 'checkout-v2',
    description: 'Compare the desktop payment flow with its first draft.',
  },
  {
    id: 'onboarding', title: 'Onboarding', currentRevisionId: 'onboarding-v1',
    description: 'A portrait welcome screen for first-time users.',
  },
  {
    id: 'library', title: 'Library', currentRevisionId: 'library-v1',
    description: 'Browse saved references and recent collections.',
  },
];

export const revisions: Revision[] = [
  {
    id: 'checkout-v1',
    frameId: 'checkout',
    label: 'Draft 1',
    imageUrl: '/frames/checkout-v1.svg',
    width: 1200,
    height: 800,
    createdAt: '2026-08-21T09:00:00.000Z',
  },
  {
    id: 'checkout-v2',
    frameId: 'checkout',
    label: 'Draft 2',
    imageUrl: '/frames/checkout-v2.svg',
    width: 1200,
    height: 800,
    createdAt: '2026-08-22T09:00:00.000Z',
  },
  {
    id: 'onboarding-v1',
    frameId: 'onboarding',
    label: 'Draft 1',
    imageUrl: '/frames/onboarding.svg',
    width: 720,
    height: 1100,
    createdAt: '2026-08-23T09:00:00.000Z',
  },
  {
    id: 'library-v1',
    frameId: 'library',
    label: 'Draft 1',
    imageUrl: '/frames/library.svg',
    width: 1440,
    height: 900,
    createdAt: '2026-08-23T10:00:00.000Z',
  },
];

export const annotations: Annotation[] = [
  {
    id: 'pin-checkout-v1',
    frameId: 'checkout',
    revisionId: 'checkout-v1',
    x: 0.72,
    y: 0.68,
    body: 'Draft 1: the order button competes with the secondary link.',
    resolved: false,
    createdAt: '2026-08-21T11:00:00.000Z',
  },
  {
    id: 'pin-checkout-v2',
    frameId: 'checkout',
    revisionId: 'checkout-v2',
    x: 0.72,
    y: 0.79,
    body: 'Draft 2: verify that the final total is readable.',
    resolved: false,
    createdAt: '2026-08-22T11:00:00.000Z',
  },
  {
    id: 'pin-onboarding',
    frameId: 'onboarding',
    revisionId: 'onboarding-v1',
    x: 0.5,
    y: 0.76,
    body: 'Does this label clearly explain what happens next?',
    resolved: false,
    createdAt: '2026-08-23T11:00:00.000Z',
  },
];
