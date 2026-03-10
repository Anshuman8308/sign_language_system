import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import TransactionCard from '../components/UI/TransactionCard.jsx';
import Loader from '../components/UI/Loader.jsx';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Deposits', value: 'DEPOSIT' },
  { label: 'Withdrawals', value: 'WITHDRAW' },
  { label: 'Sent', value: 'TRANSFER_SENT' },
  { label: 'Received', value: 'TRANSFER_RECEIVED' },
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter) params.append('type', filter);
      const res = await api.get(`/api/transactions?${params}`);
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } catch {}
    setLoading(false);
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/api/transactions/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : transactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400 text-lg">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {transactions.map((txn) => <TransactionCard key={txn._id} transaction={txn} />)}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-3">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600 text-sm">Page {page} of {pagination.pages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;
