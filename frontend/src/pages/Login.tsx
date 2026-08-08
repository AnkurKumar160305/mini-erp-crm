import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { setAuth } = useAuthStore();
  const { error: toastError, success: toastSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        setAuth(user, token);
        toastSuccess('Login successful');
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className="text-sm">
        <div className="text-slate-500 mb-4 bg-slate-50 p-3 rounded text-xs border border-slate-100">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <ul className="space-y-1">
            <li>Admin: admin@example.com</li>
            <li>Sales: sales@example.com</li>
            <li>Warehouse: warehouse@example.com</li>
            <li>Accounts: accounts@example.com</li>
            <li className="mt-2 text-slate-700">Password for all: <strong>Password123!</strong></li>
          </ul>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
      >
        Sign in
      </Button>
    </form>
  );
}
