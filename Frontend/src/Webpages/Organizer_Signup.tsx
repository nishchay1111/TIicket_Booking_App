import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';
import { useCreateOrganizerMutation } from '../redux/slice/organizerOperations'; // 👈 changed
import SignupForm from '../UI Components/SignupForm';

// ─── Branding ────────────────────────────────────────────────────────────────
const ORGANIZER_BRANDING = { // 👈 renamed
  logo: (
    <img src="/logo192.png" alt="Ticket App Logo" style={{ height: 24 }} />
  ),
  title: 'Ticket Booking',
};

// ─── 🌙 Toggle Dark Mode Here ────────────────────────────────────────────────
const DARK_MODE = true;

// ─── Component ───────────────────────────────────────────────────────────────
export default function Organizer_Signup() { // 👈 renamed
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [createOrganizer, { isSuccess, isError, error }] = useCreateOrganizerMutation(); // 👈 changed

  useEffect(() => {
    if (isSuccess) {
      dispatch(showAlert({ message: 'Organizer account created! Please log in.', severity: 'success' })); // 👈 changed message
      navigate('/organizer_login'); // 👈 changed route
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
      await createOrganizer({        // 👈 changed
        name: formData.name,         // 👈 changed to match organizer DTO
        email: formData.email,
        password: formData.password,
      }).unwrap();
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || 'Signup failed.';
      return { error: message };
    }
  };

  return (
    <SignupForm
      branding={ORGANIZER_BRANDING}                        // 👈 changed
      onSignup={handleSignup}
      darkMode={DARK_MODE}
      title="Organizer Signup"            // 👈 changed
      bottomLink={{                                      // 👈 added
        text: 'Click Here for User Sign Up',
        href: '/user_signup'
      }}
    />
  );
}