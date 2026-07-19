import React, { useEffect } from 'react';
import { type AuthProvider, type AuthResponse } from '@toolpad/core/SignInPage';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';
import { useOrganizerLoginMutation } from '../redux/slice/organizerOperations'; // 👈 changed
import LoginForm from '../UI Components/LoginForm';

// ─── Branding ───────────────────────────────────────────────────────────────
const ORGANIZER_BRANDING = { // 👈 renamed
    logo: (
        <img
            src="/logo192.png"
            alt="Ticket App Logo"
            style={{ height: 24 }}
        />
    ),
};

// ─── 🌙 Toggle Dark Mode Here ───────────────────────────────────────────────
const DARK_MODE = true;

// ─── Component ──────────────────────────────────────────────────────────────
export default function Organizer_Login() { // 👈 renamed
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [organizerLogin, { isLoading, isSuccess, isError, data, error }] = useOrganizerLoginMutation(); // 👈 changed

    useEffect(() => {
        if (isSuccess && data?.success) {
            const token = data.authToken || data.authtoken; // 👈 fallback for both naming conventions
            localStorage.setItem('token', token);
            dispatch(showAlert({ message: 'Login successful! Welcome back.', severity: 'success' }));
            navigate('*'); // 👈 changed to organizer home route
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
                await organizerLogin({ email, password }).unwrap(); // 👈 changed
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
            branding={ORGANIZER_BRANDING} // 👈 changed
            signIn={signIn}
            darkMode={DARK_MODE}
            emailAutoFocus={true}
            validate={true}
            title="Organizer Login"
            bottomLink={{                                    // 👈 add this
                text: 'Click here for User Login',
                href: '/user_login'
            }}
        />
    );
}