import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Loader from '../components/UI/Loader.jsx';
import { formatDate, formatCurrency } from '../utils/format.js';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/auth/me').then((r) => setProfile(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!profile) return <div className="text-center py-12 text-gray-500">Failed to load profile</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
            {profile.user.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.user.name}</h2>
            <p className="text-gray-500">{profile.user.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Member Since', value: formatDate(profile.user.createdAt) },
            { label: 'Currency', value: profile.wallet?.currency || 'INR' },
            { label: 'Current Balance', value: formatCurrency(profile.wallet?.balance || 0) },
            { label: 'Account Status', value: 'Verified ✓' },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <p className="font-semibold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
