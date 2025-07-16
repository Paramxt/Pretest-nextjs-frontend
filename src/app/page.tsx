'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import BackGroudApp from '../../components/layout';

export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        setMessage('เข้าสู่ระบบสำเร็จ!');
        console.log('Login successful:', data);
        localStorage.setItem('access_token', data.access_token);
        console.log('Access Token stored in localStorage:', data.access_token);
        router.push('/home');

      } else {
        setMessage(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        console.error('Login failed:', data);
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      console.error('Network error or unexpected error:', error);
    }
  };

  return (
    <div>
      <BackGroudApp>
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl space-y-8">
          <h2 className="text-4xl font-extrabold text-center text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="sr-only">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <p className={`text-center text-md ${message.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </BackGroudApp>
    </div>
  );
}
