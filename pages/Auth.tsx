import React, { useState } from 'react';
import { db } from '../services/db';
import { Button, Input, Select, Card } from '../components/UI';
import { Role } from '../types';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    email: '',
    department: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login Logic
        const user = await db.auth.login(formData.id, formData.password);
        if (user) {
          onLogin();
        } else {
          setError('Invalid Credentials or Account Blocked');
        }
      } else {
        // Register Logic
        if (!formData.id || !formData.name || !formData.password || !formData.email) {
          throw new Error("Please fill in all required fields");
        }
        await db.auth.register({
          id: formData.id,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          semester: formData.semester,
          role: Role.STUDENT
        });
        // Auto login after register
        await db.auth.login(formData.id, formData.password);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Register as a Student'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          University Sports Ground Booking System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Common Fields */}
            <Input
              label={isLogin ? "User ID / Student ID" : "Student ID"}
              name="id"
              type="text"
              value={formData.id}
              onChange={handleChange}
              placeholder={isLogin ? "e.g. S101 or admin" : "e.g. S103"}
              required
            />

            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
                 <Select
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  options={[
                    { value: '1st', label: '1st Semester' },
                    { value: '2nd', label: '2nd Semester' },
                    { value: '3rd', label: '3rd Semester' },
                    { value: '4th', label: '4th Semester' },
                    { value: '5th', label: '5th Semester' },
                    { value: '6th', label: '6th Semester' },
                    { value: '7th', label: '7th Semester' },
                    { value: '8th', label: '8th Semester' },
                  ]}
                  required
                />
              </>
            )}

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <Button type="submit" isLoading={loading} className="w-full">
              {isLogin ? 'Sign in' : 'Register'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "New Student?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </button>
            </div>
          </div>
          
          {isLogin && (
             <div className="mt-4 text-center">
                 <p className="text-xs text-gray-400">Demo Admin: ID: <b>admin</b>, Pass: <b>admin</b></p>
                 <p className="text-xs text-gray-400">Demo Student: ID: <b>S101</b>, Pass: <b>password</b></p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};