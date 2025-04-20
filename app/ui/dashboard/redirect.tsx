'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="h-12 w-12 animate-spin text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4.75V6.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.1475 6.8525L16.0625 7.9375"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.25 12H17.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.1475 17.1475L16.0625 16.0625"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 17.75V19.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.8525 17.1475L7.9375 16.0625"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.75 12H6.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.8525 6.8525L7.9375 7.9375"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default function Redirect() {
  const router = useRouter();
  const [dots, setDots] = useState('');

  // Animate the dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Redirect after delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex items-center justify-center">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          Kickstart your learning journey!
        </h1>

        <p className="text-gray-600 mb-4">
          Redirecting you to the dashboard{dots}
        </p>

        <Spinner />

        <p className="text-sm text-gray-500 mt-4">
          If you are not redirected automatically,
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:underline ml-1"
          >
            click here
          </button>
        </p>
      </div>

      <p className="text-gray-500 text-sm mt-8">
        © {new Date().getFullYear()} FocusPals
      </p>
    </div>
  );
}
