import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { signIn, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessDenied = (location.state as { accessDenied?: boolean } | null)
    ?.accessDenied ?? false;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (session && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [session, isAdmin, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      setAuthError('Invalid email or password. Please try again.');
      return;
    }
    // AuthContext will update session; the useEffect above handles navigation
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Tiny Bitty Admin</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage products</p>
        </CardHeader>
        <CardContent>
          {accessDenied && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Access denied. Your account does not have admin privileges.
            </div>
          )}

          {authError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@tinybitty.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
