import { ArrowDownUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

type TransactionTableProps = {
  transactions: Transaction[];
  onSortDate?: () => void;
  compact?: boolean;
};

export default function TransactionTable({ transactions, onSortDate, compact = false }: TransactionTableProps) {
  return (
    <div className="surface overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button className="h-auto px-0 text-muted-foreground" variant="ghost" onClick={onSortDate}>
                Date
                {onSortDate ? <ArrowDownUp className="size-3.5" /> : null}
              </Button>
            </TableHead>
            <TableHead>Description</TableHead>
            {!compact ? <TableHead>Category</TableHead> : null}
            <TableHead>Type</TableHead>
            {!compact ? <TableHead>Status</TableHead> : null}
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={compact ? 4 : 6} className="py-10 text-center text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                <TableCell className="min-w-44 font-medium">{transaction.description}</TableCell>
                {!compact ? <TableCell>{transaction.category}</TableCell> : null}
                <TableCell>
                  <Badge variant={transaction.type}>{transaction.type === "credit" ? "Credit" : "Debit"}</Badge>
                </TableCell>
                {!compact ? (
                  <TableCell>
                    <Badge variant={transaction.status === "pending" ? "pending" : "muted"}>
                      {transaction.status === "pending" ? "Pending" : "Completed"}
                    </Badge>
                  </TableCell>
                ) : null}
                <TableCell className="text-right font-semibold">{formatCurrency(transaction.amount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
