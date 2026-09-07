import type { AnalysisProvider, Capture, Profile, Report } from '../types';

export const profileDelays: Record<Profile, number> = {
  normal: 900,
  slow: 6000,
  fast: 250,
  failure: 800,
};

export function makeReport(capture: Capture, question: string): Report {
  const [first, second, third, fourth] = capture.evidence;
  return {
    summary: `Review of ${capture.title} for “${question}”. These observations use the saved capture, not a live browsing session.`,
    findings: [
      {
        id: `${capture.id}-finding-1`,
        title: 'The first message sets an expectation',
        body: `“${first.text}” establishes the main promise. Check that the next action makes the same promise concrete for someone seeing this interface for the first time.`,
        evidenceIds: [first.id, second.id],
      },
      {
        id: `${capture.id}-finding-2`,
        title: 'A consequential detail deserves attention',
        body: `The capture also says “${third.text}”. Its placement at ${third.region.toLowerCase()} may affect whether someone notices it before committing to an action.`,
        evidenceIds: [third.id],
      },
      {
        id: `${capture.id}-finding-3`,
        title: 'Validate the next step with a new user',
        body: `Ask a participant what they expect after “${fourth.text}”. The screenshot supports a hypothesis about clarity; it does not establish how people actually behave.`,
        evidenceIds: [fourth.id, second.id],
      },
    ],
  };
}

export const fixtureProvider: AnalysisProvider = async ({ capture, question, profile }) => {
  // Take the fixture snapshot before simulating provider work.
  const report = makeReport(capture, question);
  await new Promise((resolve) => setTimeout(resolve, profileDelays[profile]));
  if (profile === 'failure') {
    throw new Error('The analysis provider could not finish this attempt. Try again.');
  }
  return report;
};
