import { SCOPE_LABEL } from "@/lib/access";

type R = { id: number; title: string; description: string | null; url: string; scope: string; note: string | null };

export default function ResourceList({ items, empty }: { items: R[]; empty?: string }) {
  if (items.length === 0) return <p className="muted">{empty ?? "이용할 수 있는 자료가 없습니다."}</p>;
  return (
    <div>
      {items.map((r) => (
        <div className="res" key={r.id}>
          <div>
            <strong>{r.title}</strong> <span className="badge">{SCOPE_LABEL[r.scope]}</span>
            {r.description && <div className="muted">{r.description}</div>}
            {r.note && <div style={{ marginTop: 4 }}>📝 피드백: {r.note}</div>}
          </div>
          <a className="btn" href={r.url} target="_blank" rel="noopener noreferrer">열기</a>
        </div>
      ))}
    </div>
  );
}
