'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button';
import { useRouter } from 'next/router';


const Signup = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: API call
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      router.push('/auth/login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <form onSubmit={handleSubmit} className="shadow-lg rounded-xl p-8 w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-400 "> <span className='text-white'>Outsmart</span> all with <span className='text-white'>e4.</span>learnchess!</h1>

        <div className="flex flex-col space-y-2">
          <label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={form.username}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 "
            placeholder="Your username"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@email.com"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="p-3  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          text={`${loading ? 'Signing up...' : 'Sign Up'}`}
          disabled={loading}
        />


        <p className="mt-6 text-gray-600 text-center ">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-500 ml-1 hover:underline ">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
