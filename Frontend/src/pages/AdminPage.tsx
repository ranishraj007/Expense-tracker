import { Shield, Trash2, UsersRound, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import ErrorMessage from "@/components/common/ErrorMessage";
import TransactionTable from "@/components/expenses/TransactionTable";
import CreateUserDialog from "@/components/users/CreateUserDialog";
import ResetUserPasswordDialog from "@/components/users/ResetUserPasswordDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { expenseService } from "@/services/expenseService";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/utils/formatters";

function AdminStat({ title, value, icon: Icon }: { title: string; value: string; icon: typeof UsersRound }) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const { users, isLoading, error, createUser, removeUser, resetUserPassword } = useUsers();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    expenseService
      .listAll()
      .then(setTransactions)
      .catch((err) => setActivityError(err instanceof Error ? err.message : "Could not load admin activity."));
  }, [user?.role]);

  const totals = useMemo(
    () =>
      transactions.reduce(
        (summary, transaction) => {
          summary[transaction.type] += Number(transaction.amount);
          return summary;
        },
        { credit: 0, debit: 0 },
      ),
    [transactions],
  );

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRemove = async (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} and their expenses?`)) return;

    setDeletingId(userId);
    try {
      await removeUser(userId);
      setTransactions((current) => current.filter((transaction) => transaction.userId !== userId));
    } finally {
      setDeletingId(null);
    }
  };

  const memberCount = users.filter((profile) => profile.role !== "admin").length;

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold">Admin panel</h2>
            <Badge variant="default">Single admin</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Manage family members, review activity, and keep account access tidy.</p>
        </div>
        <CreateUserDialog onCreate={createUser} />
      </section>

      <ErrorMessage message={error || activityError} />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminStat title="Family members" value={String(memberCount)} icon={UsersRound} />
        <AdminStat title="Total credited" value={formatCurrency(totals.credit)} icon={WalletCards} />
        <AdminStat title="Total debited" value={formatCurrency(totals.debit)} icon={Shield} />
      </section>

      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h3 className="font-semibold">User management</h3>
            <p className="text-sm text-muted-foreground">The admin account is protected and cannot be removed.</p>
          </div>
          {isLoading ? <span className="text-sm text-muted-foreground">Loading...</span> : null}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((profile) => {
              const isProtectedAdmin = profile.role === "admin";
              return (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={profile.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{profile.name}</p>
                        <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{profile.email}</p>
                      <p className="text-muted-foreground">{profile.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isProtectedAdmin ? "default" : "muted"}>{profile.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <ResetUserPasswordDialog user={profile} disabled={isProtectedAdmin} onReset={resetUserPassword} />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isProtectedAdmin || deletingId === profile.id}
                        onClick={() => void handleRemove(profile.id, profile.name)}
                      >
                        <Trash2 />
                        {deletingId === profile.id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Recent family activity</h3>
          <span className="text-sm text-muted-foreground">{transactions.length} transactions</span>
        </div>
        <TransactionTable transactions={transactions.slice(0, 8)} />
      </section>
    </>
  );
}
