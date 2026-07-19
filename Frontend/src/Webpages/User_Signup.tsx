import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';
import { useCreateUserMutation } from '../redux/slice/usersOperations';
import SignupForm from '../UI Components/SignupForm';

// ─── Branding ────────────────────────────────────────────────────────────────
const USER_BRANDING = {
  logo: (
    <img src="/logo192.png" alt="Ticket App Logo" style={{ height: 24 }} />
  ),
  title: 'Ticket Booking',
};

// ─── 🌙 Toggle Dark Mode Here ────────────────────────────────────────────────
const DARK_MODE = true;

// ─── Component ───────────────────────────────────────────────────────────────
export default function User_Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [createUser, { isSuccess, isError, error }] = useCreateUserMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(showAlert({ message: 'Account created! Please log in.', severity: 'success' }));
      navigate('/user_login');
    }
  }, [isSuccess, dispatch, navigate]);

  useEffect(() => {
    if (isError) {
      const errMsg =
        (error as any)?.data?.error ||
        (error as any)?.data?.message ||
        'Signup failed. Please try again.';
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  }, [isError, error, dispatch]);

  const handleSignup = async (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ error?: string } | void> => {
    try {
      await createUser({
        name: formData.name,       // 👈 fixed from user_name
        email: formData.email,     // 👈 fixed from user_email
        password: formData.password,
      }).unwrap();
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || 'Signup failed.';
      return { error: message };
    }
  };

  return (
    <SignupForm
      branding={USER_BRANDING}
      onSignup={handleSignup}
      darkMode={DARK_MODE}
      title="User Signup"
      bottomLink={{
        text: 'Click Here for Organizer Sign Up',
        href: '/organizer_signup'
      }}
    />
  );
}