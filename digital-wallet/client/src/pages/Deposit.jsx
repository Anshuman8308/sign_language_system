import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios.js';
import InputField from '../components/UI/InputField.jsx';
import Button from '../components/UI/Button.jsx';
import toast from 'react-hot-toast';

const Deposit = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/api/wallet/deposit', {
        amount: parseFloat(data.amount),
        description: data.description || 'Deposit',
      });
      toast.success('Deposit successful!');
      navigate('/dashboard');
    } catch {}
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Deposit Money</h1>
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
            <InputField
              label="Description (Optional)"
              placeholder="e.g. Salary, Savings..."
              {...register('description')}
            />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">Deposit</Button>
            </div>
          </form>
        </div>
        <p className="mt-4 text-xs text-center text-gray-400">This is a demo app. No real money involved.</p>
      </div>
    </div>
  );
};

export default Deposit;
