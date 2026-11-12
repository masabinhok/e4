"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/Button";
import { PageSpinner } from "@/components/ProtectedRoute";
import { api, errorMessage } from "@/lib/api";
import { useMessageStore } from "@/store/messageStore";
import { Opening, OpeningVariation, Status, User } from "@/types/types";

type AdminData = {
  users: User[];
  openings: Opening[];
  variations: OpeningVariation[];
};
type Kind = "user" | "opening" | "variation";
const tabs = ["Review", "Openings", "Users"] as const;

// Two-step delete: the first tap arms it, the second confirms. No browser dialogs.
function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="flex gap-1">
      <Button variant="danger" onClick={onConfirm}>
        Delete
      </Button>
      <Button variant="ghost" onClick={() => setArmed(false)}>
        Keep
      </Button>
    </span>
  ) : (
    <Button variant="ghost" onClick={() => setArmed(true)}>
      Delete
    </Button>
  );
}

function Item({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-sm text-muted">{detail}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">{children}</div>
    </li>
  );
}

export default function AdminPage() {
  const addMessage = useMessageStore((s) => s.addMessage);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Review");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await api<AdminData>("/admin"));
    } catch (err) {
      addMessage({
        content: errorMessage(err, "Couldn't load admin data."),
        type: "error",
      });
    }
  }, [addMessage]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (path: string, method: "POST" | "DELETE", done: string) => {
    try {
      await api(path, { method });
      addMessage({ content: done, type: "success" });
      load();
    } catch (err) {
      addMessage({ content: errorMessage(err), type: "error" });
    }
  };
  const approve = (kind: Kind, id: string) =>
    act(`/admin/${kind}/toggle-status/${id}`, "POST", "Approved.");
  const remove = (kind: Kind, id: string) =>
    act(`/admin/${kind}/${id}`, "DELETE", "Deleted.");

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.users ?? []).filter(
      (u) => !q || `${u.fullName} ${u.email}`.toLowerCase().includes(q),
    );
  }, [data, query]);

  if (!data) return <PageSpinner />;

  const pendingOpenings = data.openings.filter(
    (o) => o.status === Status.Pending,
  );
  const pendingLines = data.variations.filter(
    (v) => v.status === Status.Pending,
  );
  const accepted = data.openings.filter((o) => o.status === Status.Accepted);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl">Admin</h1>
        <p className="mt-2 text-muted">
          {data.users.length} users · {accepted.length} openings ·{" "}
          {pendingOpenings.length + pendingLines.length} waiting for review
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Admin sections"
        className="flex gap-1 rounded-xl border border-line bg-surface p-1 sm:w-fit"
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-11 flex-1 rounded-lg px-5 text-sm font-medium sm:flex-none ${
              tab === t ? "bg-raised text-ivory" : "text-muted hover:text-ivory"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Review" && (
        <section className="flex flex-col gap-6">
          {pendingOpenings.length + pendingLines.length === 0 && (
            <p className="text-muted">
              Nothing to review. New submissions show up here.
            </p>
          )}
          {pendingOpenings.length > 0 && (
            <ul className="flex flex-col gap-2" aria-label="Suggested openings">
              {pendingOpenings.map((o) => (
                <Item
                  key={o._id}
                  title={`Opening: ${o.name}`}
                  detail={o.description}
                >
                  <Button onClick={() => approve("opening", o._id)}>
                    Approve
                  </Button>
                  <DeleteButton onConfirm={() => remove("opening", o._id)} />
                </Item>
              ))}
            </ul>
          )}
          {pendingLines.length > 0 && (
            <ul className="flex flex-col gap-2" aria-label="Suggested lines">
              {pendingLines.map((v) => (
                <Item
                  key={v._id}
                  title={`${v.title} (${v.code})`}
                  detail={v.moves.join(" ")}
                >
                  <Button onClick={() => approve("variation", v._id)}>
                    Approve
                  </Button>
                  <DeleteButton onConfirm={() => remove("variation", v._id)} />
                </Item>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "Openings" && (
        <ul className="flex flex-col gap-2">
          {accepted.map((o) => (
            <Item
              key={o._id}
              title={o.name}
              detail={`${o.code} · ${o.variations.length} lines`}
            >
              <Button href={`/lessons/${o.code}`} variant="secondary">
                Open
              </Button>
              <DeleteButton onConfirm={() => remove("opening", o._id)} />
            </Item>
          ))}
        </ul>
      )}

      {tab === "Users" && (
        <section className="flex flex-col gap-4">
          <label className="relative block max-w-sm">
            <span className="sr-only">Search users</span>
            <Search
              className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-line bg-raised py-3 pr-4 pl-10 focus:border-brass focus:outline-none"
            />
          </label>
          <ul className="flex flex-col gap-2">
            {users.map((u) => (
              <Item
                key={u._id}
                title={`${u.isDemo ? "Demo visitor" : u.fullName}${u.role === "ADMIN" ? " (admin)" : ""}`}
                detail={`${u.email} · joined ${new Date(u.createdAt).toLocaleDateString()}`}
              >
                {u.role !== "ADMIN" && (
                  <DeleteButton onConfirm={() => remove("user", u._id)} />
                )}
              </Item>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
