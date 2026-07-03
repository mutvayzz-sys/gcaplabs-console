"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export function UsersTable({
  initialUsers,
  initialTotal,
  pageSize,
}: {
  initialUsers: AdminProfileRow[];
  initialTotal: number;
  pageSize: number;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce search: re-fetch page 1 whenever the query settles for 300ms.
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      fetchUsers(1, query);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function fetchUsers(nextPage: number, q: string) {
    setIsListLoading(true);
    setErrorMessage(null);
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
    if (q) params.set("q", q);
    fetch(`/api/admin/users?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load users");
        setUsers(data.users as AdminProfileRow[]);
        setTotal(data.total as number);
      })
      .catch((e) => setErrorMessage(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => setIsListLoading(false));
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    fetchUsers(nextPage, query);
  }

  function updateUser(user: AdminProfileRow, patch: { beta_approved?: boolean; is_admin?: boolean }) {
    setPendingId(user.id);
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, ...patch }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update user");
        setUsers((prev) => prev.map((u) => (u.id === user.id ? (data.user as AdminProfileRow) : u)));
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Failed to update user");
      } finally {
        setPendingId(null);
      }
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by email or name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_110px_90px_140px_100px] border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Email</span>
          <span>Approved</span>
          <span>Admin</span>
          <span>Runtime</span>
          <span />
        </div>
        {users.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">{isListLoading ? "Loading…" : "No signups found."}</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="grid grid-cols-[1fr_110px_90px_140px_100px] items-center border-b px-4 py-3 text-sm last:border-b-0">
              <Link href={`/dashboard/admin/users/${user.id}`} className="truncate font-medium hover:underline">
                {user.email ?? user.display_name ?? user.id}
              </Link>
              <span>
                <Badge variant={user.beta_approved ? "success" : "warning"}>{user.beta_approved ? "Approved" : "Pending"}</Badge>
              </span>
              <span>{user.is_admin ? <Badge variant="success">Admin</Badge> : null}</span>
              <span className="truncate text-xs text-muted-foreground">{user.agent37_id ? (user.agent37_status ?? "provisioned") : "none yet"}</span>
              <span className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant={user.beta_approved ? "outline" : "default"}
                  disabled={isPending && pendingId === user.id}
                  onClick={() => updateUser(user, { beta_approved: !user.beta_approved })}
                >
                  {isPending && pendingId === user.id ? "…" : user.beta_approved ? "Revoke" : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending && pendingId === user.id}
                  onClick={() => updateUser(user, { is_admin: !user.is_admin })}
                >
                  {user.is_admin ? "Remove admin" : "Make admin"}
                </Button>
              </span>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1 || isListLoading} onClick={() => goToPage(page - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages || isListLoading} onClick={() => goToPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
