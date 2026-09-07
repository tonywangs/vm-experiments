import type { Document, SearchResult } from '../types';

interface Props {
  result: SearchResult;
  documents: Document[];
  onOpen: (document: Document) => void;
}

export function AnswerPanel({ result, documents, onOpen }: Props) {
  return (
    <section className="answer-panel" aria-label="Research answer">
      <div className="section-heading">
        <div><span className="eyebrow">Evidence summary</span><h2>{result.query}</h2></div>
        <span className="badge">Local adapter</span>
      </div>
      <div className="answer-text">{result.answer}</div>
      {result.citations.length > 0 && (
        <div className="citations" aria-label="Answer citations">
          {result.citations.map((citation) => {
            const document = documents[citation.number - 1];
            return (
              <button key={citation.number} className="citation" onClick={() => document && onOpen(document)}>
                Source {citation.number}
              </button>
            );
          })}
        </div>
      )}
      <p className="fine-print">Open a source to inspect the original evidence before sharing an answer.</p>
    </section>
  );
}
