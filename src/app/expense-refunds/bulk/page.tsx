import { Metadata } from 'next';
import BulkExpenseRefundClient from './BulkExpenseRefundClient';

export const metadata: Metadata = {
  title: 'Bulk Expense Refunds | Whiteprompt',
  description: 'Submit multiple expense refunds efficiently with AI extraction',
};

export default function BulkExpenseRefundPage() {
  return <BulkExpenseRefundClient />;
}