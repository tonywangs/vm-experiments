import type { Profile } from '../types';

export function QuestionComposer({
  question,
  onQuestionChange,
  profile,
  onProfileChange,
  submitting,
  onSubmit,
}: {
  question: string;
  onQuestionChange: (value: string) => void;
  profile: Profile;
  onProfileChange: (value: Profile) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <form
      className="question-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="question-heading">
        <span className="sparkle" aria-hidden="true">
          ✳
        </span>
        <div>
          <h2>Ask about this capture</h2>
          <p>Start with something you want to understand.</p>
        </div>
      </div>
      <label htmlFor="question">Research question</label>
      <textarea
        id="question"
        data-testid="question-input"
        maxLength={800}
        rows={3}
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="What might a new user find surprising?"
      />
      <div className="question-actions">
        <span>{question.length}/800</span>
        <button
          className="primary-button"
          data-testid="analyze-button"
          type="submit"
          disabled={submitting || !question.trim()}
        >
          {submitting ? 'Starting…' : 'Analyze capture'}{' '}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="fixture-control">
        <label htmlFor="profile">Local provider fixture</label>
        <select
          id="profile"
          data-testid="profile-select"
          value={profile}
          onChange={(event) => onProfileChange(event.target.value as Profile)}
        >
          <option value="normal">Normal · 0.9s</option>
          <option value="slow">Slow · 6s</option>
          <option value="fast">Fast · 0.25s</option>
          <option value="failure">Failure · 0.8s</option>
        </select>
      </div>
    </form>
  );
}
