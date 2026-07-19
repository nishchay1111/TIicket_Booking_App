import * as React from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Link,  // 👈 add Link
} from '@mui/material';
import type { Branding } from '@toolpad/core';

// ─── Props Interface ────────────────────────────────────────────────────────
interface SignupFormProps {
  branding?: Branding;
  onSignup: (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ error?: string } | void>;
  darkMode?: boolean;
  title?: string;
  bottomLink?: { text: string; href: string }; // 👈 added
}

// ─── Default Values ─────────────────────────────────────────────────────────
const DEFAULT_BRANDING: Branding = {
  logo: (
    <img src="/logo192.png" alt="Ticket App Logo" style={{ height: 24 }} />
  ),
  title: 'Ticket Booking',
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function SignupForm({
  branding = DEFAULT_BRANDING,
  onSignup,
  darkMode = false,
  title,
  bottomLink, // 👈 added
}: SignupFormProps) {

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const name = `${firstName.trim()} ${lastName.trim()}`.trim();
  const passwordsMatch = password === confirmPassword;
  const confirmPasswordError = !!confirmPassword && !passwordsMatch;

  const isButtonDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    !passwordsMatch ||
    isLoading;

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }),
    [darkMode]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onSignup({ name, email, password, confirmPassword });
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}
        >
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {branding.logo}
          </Box>

          {/* ── Title ─────────────────────────────────────────────────── */}
          {title && (
            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              sx={{ mb: 2, color: darkMode ? '#fff' : '#000' }}
            >
              {title}
            </Typography>
          )}

          {/* ── Form ──────────────────────────────────────────────────── */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Last Name"
                required
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Box>

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              label="Confirm Password"
              type="password"
              required
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              helperText={confirmPasswordError ? 'Passwords do not match' : ''}
            />

            {error && (
              <Typography variant="body2" color="error" textAlign="center">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="outlined"
              fullWidth
              disabled={isButtonDisabled}
              sx={{ mt: 1, py: 1.2 }}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up With Credentials'}
            </Button>

            {/* 👈 Bottom link — renders directly below the button inside the card */}
            {bottomLink && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link
                  href={bottomLink.href}
                  underline="hover"
                  sx={{ color: darkMode ? '#90caf9' : '#1976d2', fontSize: '14px' }}
                >
                  {bottomLink.text}
                </Link>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}