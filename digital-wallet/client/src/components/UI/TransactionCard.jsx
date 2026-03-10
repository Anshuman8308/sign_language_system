import { formatCurrency, formatDate } from '../../utils/format.js';

const typeConfig = {
  DEPOSIT: { icon: '↓', colorClass: 'bg-green-100 text-green-700', sign: '+', amountClass: 'text-green-600' },
  WITHDRAW: { icon: '↑', colorClass: 'bg-red-100 text-red-700', sign: '-', amountClass: 'text-red-600' },
  TRANSFER_SENT: { icon: '→', colorClass: 'bg-orange-100 text-orange-700', sign: '-', amountClass: 'text-red-600' },
  TRANSFER_RECEIVED: { icon: '←', colorClass: 'bg-blue-100 text-blue-700', sign: '+', amountClass: 'text-green-600' },
};

const statusColors = {
  SUCCESS: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REVERSED: 'bg-gray-100 text-gray-800',
};

const TransactionCard = ({ transaction }) => {
  const cfg = typeConfig[transaction.type] || typeConfig.DEPOSIT;
  const amount = parseFloat(transaction.amount || 0);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${cfg.colorClass}`}>
          {cfg.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900 capitalize">
            {transaction.type.toLowerCase().replace(/_/g, ' ')}
          </p>
          <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
          {transaction.description && (
            <p className="text-xs text-gray-400 mt-0.5">{transaction.description}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${cfg.amountClass}`}>
          {cfg.sign}{formatCurrency(amount)}
        </p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[transaction.status] || statusColors.PENDING}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

export default TransactionCard;
