'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackGroudApp, { BackGroudAppFront } from '../../../../components/layout';
import TopBar from '../../../../components/TopBar';

const FrontPage: React.FC = () => {
  const [emailOrUsername, setemailOrUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    console.log(emailOrUsername, password);

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: emailOrUsername,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('เข้าสู่ระบบสำเร็จ!');
        console.log('Login successful:', data);

        if (data.user_access_token) {
          localStorage.setItem('user_access_token', data.user_access_token);
          console.log('Access Token stored in localStorage:', data.user_access_token);
        } else {
          console.warn('Backend did not return an user_access_token.');
        }
        router.push('/frontend/home');
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
    <BackGroudAppFront>
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl space-y-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-900">
          เข้าสู่ระบบ
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="emailOrUsername" className="sr-only">
              อีเมล
            </label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              autoComplete="emailOrUsername"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg"
              placeholder="อีเมล"
              value={emailOrUsername}
              onChange={(e) => setemailOrUsername(e.target.value)}
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>
    </BackGroudAppFront>
  );
};

export default FrontPage;
