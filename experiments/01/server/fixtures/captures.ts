import type { Capture } from '../types';

export const captures: Capture[] = [
  {
    id: 'atlas',
    title: 'Atlas / first impressions',
    description: 'An onboarding page that asks a new team to connect its first project.',
    sourceUrl: 'https://atlas.example/onboarding',
    imageUrl: '/captures/atlas.svg',
    category: 'Onboarding',
    capturedAt: '2026-08-28T10:30:00.000Z',
    evidenceCount: 4,
    evidence: [
      { id: 'atlas-headline', label: 'Primary headline', text: 'Your next project starts here. Bring your team, leave the busywork.', region: 'Top left' },
      { id: 'atlas-connect', label: 'Primary action', text: 'Connect a project. GitHub, GitLab, or start from a template.', region: 'Center' },
      { id: 'atlas-trust', label: 'Trust detail', text: 'Read-only access until you approve your first change.', region: 'Below primary action' },
      { id: 'atlas-progress', label: 'Progress indicator', text: 'Step 1 of 3 — Connect, invite, launch.', region: 'Top right' },
    ],
  },
  {
    id: 'relay',
    title: 'Relay / checkout flow',
    description: 'A subscription checkout with a trial and an annual billing default.',
    sourceUrl: 'https://relay.example/checkout',
    imageUrl: '/captures/relay.svg',
    category: 'Checkout',
    capturedAt: '2026-08-29T14:10:00.000Z',
    evidenceCount: 4,
    evidence: [
      { id: 'relay-plan', label: 'Selected plan', text: 'Team plan — $24 per seat / month, billed annually. 5 seats.', region: 'Order summary' },
      { id: 'relay-trial', label: 'Trial promise', text: 'Start your 14-day free trial. No charge today.', region: 'Checkout heading' },
      { id: 'relay-total', label: 'Future charge', text: '$1,440 due after your trial. Taxes may apply.', region: 'Summary footer' },
      { id: 'relay-action', label: 'Checkout action', text: 'Start free trial. By continuing you agree to the subscription terms.', region: 'Bottom right' },
    ],
  },
  {
    id: 'prism',
    title: 'Prism / sharing a report',
    description: 'A report-sharing dialog with workspace and public-link permissions.',
    sourceUrl: 'https://prism.example/reports/share',
    imageUrl: '/captures/prism.svg',
    category: 'Collaboration',
    capturedAt: '2026-08-30T09:00:00.000Z',
    evidenceCount: 4,
    evidence: [
      { id: 'prism-access', label: 'Default audience', text: 'General access: people in your workspace can view.', region: 'Dialog middle' },
      { id: 'prism-link', label: 'Link action', text: 'Copy link. Anyone with access can open this report.', region: 'Dialog footer' },
      { id: 'prism-public', label: 'Optional audience', text: 'Publish to the web — off. Your report will be visible to anyone with the link.', region: 'Advanced section' },
      { id: 'prism-invite', label: 'Invite field', text: 'Add a person by email. Role: viewer.', region: 'Dialog top' },
    ],
  },
];

// Captured evidence is served through a local storage stand-in.
export const storageLatency: Record<string, number> = {
  atlas: 100,
  relay: 650,
  prism: 40,
};
