import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { SignInForm } from '@/components/auth/signin-form';

export const metadata: Metadata = {
  title: 'Sign In - Creator Ops Division',
  description: 'Sign in to your Creator Ops Division account',
};

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Creator Ops Division</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Creator Network Dashboard
          </p>
        </div>

        <SignInForm />

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Syndicate Holdings Group LLC</p>
          <p className="mt-1">Spartanburg, South Carolina</p>
        </div>
      </div>
    </div>
  );
}
