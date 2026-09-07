# Local connector and answer adapter

Fieldnotes models a small integration with two document systems. All behavior lives in the repository; no request leaves the VM.

## Reading a source

The `PageProvider` contract accepts `(sourceId, cursor)` and returns:

```ts
{
  documents: RemoteDocument[];
  nextCursor: string | null;
}
```

Begin with `cursor = null`. Supply each returned cursor unchanged in the next call. Cursors are opaque: do not parse their punctuation, infer page numbers, or share them between sources. `nextCursor: null` means traversal is complete. An empty `documents` array alone says nothing about whether there is another page. Providers can have empty segments after permissions filtering.

The local sources deliberately contain these ordinary provider conditions:

| Source | Page contents | Total |
| --- | --- | ---: |
| Atlas product notes | 2 documents, then 0, then 2 | 4 documents / 3 pages |
| Beacon support desk | 2 documents, then 1 | 3 documents / 2 pages |

Each call takes about 160 ms. Logs include the input and output cursors. There are no transient failures, rate limits, or time-dependent fixtures.

## Document identity

`RemoteDocument.id` identifies a document **within its source**. For example, both sources have an `overview` and a `handoff` document. Their content and original URLs differ. The local application's `Document.id` must identify a stored document across the entire library. Clients treat it as an opaque string.

A second import is an upsert of the same source's documents. It must update content when necessary and must not create a second local copy. Imports do not delete documents that have disappeared upstream; deletion support is outside this exercise. The initial database contains one real Atlas document as a local sample, so reimporting Atlas must reconcile that sample too.

## Retrieval and citations

Search tokenizes the query, scores title/body matches, and returns up to five documents in relevance order. Ties use the local document identifier. It creates an answer from the first three evidence documents.

A search response contains the original accepted query, `answer`, `documents`, and `citations`. The response's query belongs to that result even if a user later edits the input without searching again. Each citation has:

```ts
{
  number: number;       // Display label used in the answer, starting at 1.
  documentId: string;   // Authoritative local document identity.
  quote: string;       // Evidence snippet from the cited document.
}
```

All cited documents are present in the response's `documents` array. The document array is a retrieval result, not a citation lookup table. The user may reorder its presentation. Citation numbers and destinations belong to the answer and must remain stable.

## Sharing example

A copy of an answer should read naturally when pasted into a Markdown document:

```markdown
## What should we review?

A claim supported by the notes. [1]

Sources
1. [Original note title](https://source.example/note) — Source name
```

Formatting whitespace and heading level are flexible. The query, answer, citation numbers/order, title, original URL, and source name are required. Use the displayed result's evidence; include no uncited library documents.
