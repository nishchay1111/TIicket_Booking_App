import React, { useEffect } from 'react';
import { type AuthProvider, type AuthResponse } from '@toolpad/core/SignInPage';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';
import { useLoginMutation } from '../redux/slice/usersOperations';
import LoginForm from '../UI Components/LoginForm';

// ─── Branding ───────────────────────────────────────────────────────────────
const USER_BRANDING = {
  logo: (
    <img
      src="/logo192.png"
      alt="Ticket App Logo"
      style={{ height: 24 }}
    />
  ),
};

// ─── 🌙 Toggle Dark Mode Here ───────────────────────────────────────────────
const DARK_MODE = true;  // ← Change to true for dark, false for light

// ─── Component ──────────────────────────────────────────────────────────────
export default function User_Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading, isSuccess, isError, data, error }] = useLoginMutation();

  useEffect(() => {
    if (isSuccess && data?.success) {
      localStorage.setItem('token', data.authtoken);
      dispatch(showAlert({ message: 'Login successful! Welcome back.', severity: 'success' }));
      navigate('*');
    }
  }, [isSuccess, data, dispatch, navigate]);

  useEffect(() => {
    if (isError) {
      const errMsg =
        (error as any)?.data?.error ||
        (error as any)?.data?.message ||
        'Login failed. Please check your credentials.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  }, [isError, error, dispatch]);

  const signIn = async (
    provider: AuthProvider,
    formData?: any,
    callbackUrl?: string
  ): Promise<AuthResponse> => {
    if (provider.id === 'credentials') {
      const email = formData?.get('email') as string;
      const password = formData?.get('password') as string;

      if (!email || !password) {
        return { error: 'Email and password are required.' };
      }

      try {
        await login({ email, password }).unwrap();
        return {};
      } catch (err: any) {
        const message =
          err?.data?.error || err?.data?.message || 'Invalid credentials.';
        return { error: message };
      }
    }
    return { error: 'Unsupported provider.' };
  };

  return (
    <LoginForm
      branding={USER_BRANDING}
      signIn={signIn}
      darkMode={DARK_MODE}
      emailAutoFocus={true}
      validate={true}
      title="User Login"  // ← Your custom title displayed on page
      bottomLink={{                                    // 👈 add this
      text: 'Click here for Organizer Login',
      href: '/organizer_login'
    }}
    />
  );
}