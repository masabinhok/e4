'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/services/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('hi')
      await login(formData.username, formData.password);
      console.log('hi')
      router.push('/');
    } catch (err) {
      console.error('Login failed', err);
      setError('Login Failed');
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-2xl p-10 w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-600">
          ♟️ Login to e4
        </h2>

        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="masabinhok"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200 text-base"
            required
          />
        </div>

        <div className="mb-8 relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="••••••••"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200 text-base"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-9 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button type="submit" text="Login" />

        {error && <p className="text-red-600 mt-6 text-center text-sm">{error}</p>}

        <p className="text-center text-gray-600 text-sm mt-8">
          New to e4?    {' '}
          <a href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
