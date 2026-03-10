import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios.js';
import useAuthStore from '../store/authStore.js';
import InputField from '../components/UI/InputField.jsx';
import Button from '../components/UI/Button.jsx';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/register', data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              label="Full Name"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              error={errors.name?.message}
            />
            <InputField
              label="Email"
              type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              error={errors.email?.message}
            />
            <InputField
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              error={errors.password?.message}
            />
            <InputField
              label="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === watch('password') || "Passwords don't match",
              })}
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" isLoading={isLoading} className="w-full">Create Account</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
