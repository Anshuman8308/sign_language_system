import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import Loader from '../components/UI/Loader.jsx';
import TransactionCard from '../components/UI/TransactionCard.jsx';
import { formatCurrency } from '../utils/format.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, txnRes] = await Promise.all([
          api.get('/api/wallet/balance'),
          api.get('/api/transactions?limit=5'),
        ]);
        setBalance(balRes.data.data.balance);
        setTransactions(txnRes.data.data.transactions);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here's your wallet overview</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white mb-8">
        <p className="text-blue-100 text-lg mb-2">Total Balance</p>
        <h2 className="text-5xl font-bold mb-6">{formatCurrency(balance)}</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/deposit" className="bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition text-sm">
            + Deposit
          </Link>
          <Link to="/transfer" className="bg-blue-700 text-white border border-blue-500 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition text-sm">
            ↔ Transfer
          </Link>
          <Link to="/withdraw" className="bg-blue-700 text-white border border-blue-500 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition text-sm">
            ↑ Withdraw
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/deposit" className="card border-l-4 border-green-500 hover:shadow-lg">
          <h3 className="font-semibold text-lg text-gray-900">Deposit</h3>
          <p className="text-gray-500 text-sm mt-1">Add money to your wallet</p>
        </Link>
        <Link to="/withdraw" className="card border-l-4 border-red-500 hover:shadow-lg">
          <h3 className="font-semibold text-lg text-gray-900">Withdraw</h3>
          <p className="text-gray-500 text-sm mt-1">Withdraw to your bank</p>
        </Link>
        <Link to="/transfer" className="card border-l-4 border-blue-500 hover:shadow-lg">
          <h3 className="font-semibold text-lg text-gray-900">Transfer</h3>
          <p className="text-gray-500 text-sm mt-1">Send money to others</p>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
          <Link to="/transactions" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All →</Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet. Start by depositing some money!</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => <TransactionCard key={txn._id} transaction={txn} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
