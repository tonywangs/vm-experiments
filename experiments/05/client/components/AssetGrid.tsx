import type { Asset, BatchItem } from "../types";

export function AssetGrid({ items, assets }: { items: BatchItem[]; assets: Asset[] }) {
  return <div className="asset-grid">
    {items.map((item) => {
      const asset = assets.find((entry) => entry.id === item.assetId);
      return <article className="asset-card" key={item.id}>
        <div className="asset-image">
          <img src={`/assets/${asset?.filename}`} alt={asset?.title || item.assetId} />
          <span className="frame-number">{String(item.ordinal + 1).padStart(2, "0")}</span>
        </div>
        <div className="asset-body">
          <h3>{asset?.title || item.assetId}</h3>
          {item.analysis ? <>
            <p>{item.analysis.summary}</p>
            <div className="analysis-labels">
              <span className="palette"><i style={{ background: item.analysis.palette }} />{item.analysis.palette}</span>
              <span className={item.analysis.attention === "review" ? "attention" : "muted"}>
                {item.analysis.attention === "review" ? "Check contrast" : "Looks clear"}
              </span>
            </div>
          </> : item.error ? <p className="error-text">{item.error}</p> : <p className="muted">Waiting for analysis</p>}
        </div>
      </article>;
    })}
  </div>;
}
