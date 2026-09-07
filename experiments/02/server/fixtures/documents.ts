import type { RemoteDocument } from '../types';

const updatedAt = '2026-08-19T14:30:00.000Z';

export const atlasDocuments: RemoteDocument[] = [
  {
    id: 'overview', title: 'Onboarding field study', updatedAt,
    url: 'https://atlas.example/notes/overview', tags: ['research', 'onboarding'],
    body: 'Onboarding interviews found that a blank workspace makes the first session feel unfinished. Participants wanted one useful example before importing their own data. Five of eight people asked where to begin. The next study will compare an empty workspace with a guided sample.',
  },
  {
    id: 'activation', title: 'Activation event definitions', updatedAt,
    url: 'https://atlas.example/notes/activation', tags: ['metrics', 'onboarding'],
    body: 'Activation means saving a first useful answer with a verified source. A page view alone is not activation. Instrument the answer, source visit, and save as separate events. The onboarding team should report both the count and the denominator for every conversion rate.',
  },
  {
    id: 'handoff', title: 'Research handoff checklist', updatedAt,
    url: 'https://atlas.example/notes/handoff', tags: ['research', 'handoff'],
    body: 'Every research handoff includes an exact question, the evidence reviewed, and the uncertainty left open. Link to original notes instead of copying unexplained summaries. The owner must be able to retrace a recommendation from the answer to the original document.',
  },
  {
    id: 'privacy', title: 'Workspace privacy decision', updatedAt,
    url: 'https://atlas.example/notes/privacy', tags: ['privacy', 'workspace'],
    body: 'Workspace imports are private to the selected project. Customer transcripts must not appear in a public demonstration. Use synthetic examples for onboarding and review each linked source before sharing a research answer outside the team.',
  },
];

export const beaconDocuments: RemoteDocument[] = [
  {
    id: 'overview', title: 'Support onboarding guide', updatedAt,
    url: 'https://beacon.example/handbook/overview', tags: ['support', 'onboarding'],
    body: 'Support onboarding begins with reading three resolved customer cases. New teammates pair with the queue owner and draft a response before sending one. The support guide is different from the product onboarding study: it describes training teammates, not activating customers.',
  },
  {
    id: 'escalation', title: 'Escalation contacts', updatedAt,
    url: 'https://beacon.example/handbook/escalation', tags: ['support', 'operations'],
    body: 'Escalate broken sign-in and missing customer data to the on-call engineer. Include the workspace identifier and a short reproduction, but never paste a secret token. If the incident affects more than one account, open a shared incident note before answering individual tickets.',
  },
  {
    id: 'handoff', title: 'Support shift handoff', updatedAt,
    url: 'https://beacon.example/handbook/handoff', tags: ['support', 'handoff'],
    body: 'The support shift handoff records unresolved cases, their current owner, and the next promised update. A useful handoff includes a link to the original conversation and a clear next action. Do not close the old shift until the new owner acknowledges the queue.',
  },
];
