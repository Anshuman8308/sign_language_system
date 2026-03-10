import { forwardRef } from 'react';

const InputField = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      ref={ref}
      type={type}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

InputField.displayName = 'InputField';
export default InputField;
