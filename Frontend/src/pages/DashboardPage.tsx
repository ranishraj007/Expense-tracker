import { BarChart3, CreditCard, Receipt, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ErrorMessage from "@/components/common/ErrorMessage";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import TransactionTable from "@/components/expenses/TransactionTable";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import { buildDailyExpenses, buildMonthlyExpenses, getCurrentMonthTotals } from "@/utils/analytics";
import { formatCurrency } from "@/utils/formatters";

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: typeof Receipt; tone: string }) {
  return (
    <div className="surface p-5 transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(30,41,59,0.12)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, isLoading, error, addExpense } = useExpenses(user?.id);
  const dailyData = buildDailyExpenses(transactions);
  const monthlyData = buildMonthlyExpenses(transactions);
  const totals = getCurrentMonthTotals(transactions);
  const recent = transactions.slice(0, 5);

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold">Good to see you, {user?.name.split(" ")[0]}</h2>
            <Badge variant="muted">{user?.role}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Here is the family budget pulse for this week and month.</p>
        </div>
        <AddExpenseDialog onAdd={addExpense} />
      </section>

      <ErrorMessage message={error} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Credited this month" value={formatCurrency(totals.credit)} icon={TrendingUp} tone="bg-emerald-100 text-emerald-700" />
        <StatCard title="Debited this month" value={formatCurrency(totals.debit)} icon={CreditCard} tone="bg-rose-100 text-rose-700" />
        <StatCard title="Transactions tracked" value={String(transactions.length)} icon={Receipt} tone="bg-accent text-accent-foreground" />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h3 className="font-semibold">Daily expenses, last 7 days</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#2d8178" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h3 className="font-semibold">Monthly expenses, current year</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="amount" stroke="#d97706" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Recent transactions</h3>
          {isLoading ? <span className="text-sm text-muted-foreground">Loading...</span> : null}
        </div>
        <TransactionTable compact transactions={recent} />
      </section>
    </>
  );
}
