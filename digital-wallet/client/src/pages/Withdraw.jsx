import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios.js';
import InputField from '../components/UI/InputField.jsx';
import Button from '../components/UI/Button.jsx';
import { formatCurrency } from '../utils/format.js';
import toast from 'react-hot-toast';

const Withdraw = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const amount = watch('amount');

  useEffect(() => {
    api.get('/api/wallet/balance').then((r) => setBalance(r.data.data.balance)).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/api/wallet/withdraw', {
        amount: parseFloat(data.amount),
        description: data.description || 'Withdrawal',
      });
      toast.success('Withdrawal successful!');
      navigate('/dashboard');
    } catch {}
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Withdraw Money</h1>
        <p className="text-gray-500 mb-6">Available: {formatCurrency(balance)}</p>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                valueAsNumber: true,
              })}
              error={errors.amount?.message}
            />
            {amount > balance && <p className="text-sm text-red-600">Amount exceeds available balance</p>}
            <InputField label="Description (Optional)" {...register('description')} />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button type="submit" isLoading={isLoading} disabled={amount > balance} className="flex-1">Withdraw</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
