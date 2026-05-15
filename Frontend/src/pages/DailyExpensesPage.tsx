import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import TransactionTable from "@/components/expenses/TransactionTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import type { TransactionFilters } from "@/types";

export default function DailyExpensesPage() {
  const { user } = useAuth();
  const { transactions, isLoading, error, addExpense, updateExpense, deleteExpense } = useExpenses(user?.id);
  const [filters, setFilters] = useState<TransactionFilters>({ date: "", category: "all", type: "all", status: "all", sort: "newest" });

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => (filters.date ? transaction.date === filters.date : true))
      .filter((transaction) => (filters.category !== "all" ? transaction.category === filters.category : true))
      .filter((transaction) => (filters.type !== "all" ? transaction.type === filters.type : true))
      .filter((transaction) => (filters.status !== "all" ? transaction.status === filters.status : true))
      .sort((a, b) => {
        if (filters.sort === "oldest") return a.date.localeCompare(b.date);
        if (filters.sort === "amount-high") return b.amount - a.amount;
        if (filters.sort === "amount-low") return a.amount - b.amount;
        return b.date.localeCompare(a.date);
      });
  }, [filters, transactions]);

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Daily expenses</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sort and filter shared household credits and debits.</p>
        </div>
        <AddExpenseDialog onAdd={addExpense} />
      </section>

      <ErrorMessage message={error} />

      <section className="surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="size-5 text-primary" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="grid gap-2">
            <Label htmlFor="filter-date">Date</Label>
            <Input id="filter-date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(category) => setFilters({ ...filters, category })}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={filters.type} onValueChange={(type) => setFilters({ ...filters, type: type as TransactionFilters["type"] })}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Sort</Label>
            <Select value={filters.sort} onValueChange={(sort) => setFilters({ ...filters, sort: sort as TransactionFilters["sort"] })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="amount-high">Amount high to low</SelectItem>
                <SelectItem value="amount-low">Amount low to high</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(status) => setFilters({ ...filters, status: status as TransactionFilters["status"] })}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading transactions..." : `${filteredTransactions.length} transactions shown`}
        </p>
      </div>
      <TransactionTable
        transactions={filteredTransactions}
        onSortDate={() => setFilters({ ...filters, sort: filters.sort === "newest" ? "oldest" : "newest" })}
        onUpdate={updateExpense}
        onDelete={deleteExpense}
      />
    </>
  );
}
