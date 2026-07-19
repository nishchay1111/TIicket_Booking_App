import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, type AuthProvider, type AuthResponse } from '@toolpad/core/SignInPage';
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles, Typography, Link, Box } from '@mui/material';
import type { Branding } from '@toolpad/core';

interface LoginFormProps {
  branding?: Branding;
  providers?: AuthProvider[];
  signIn: (provider: AuthProvider, formData?: any, callbackUrl?: string) => Promise<AuthResponse>;
  darkMode?: boolean;
  emailAutoFocus?: boolean;
  validate?: boolean;
  title?: string;
  bottomLink?: { text: string; href: string };
}

const DEFAULT_BRANDING: Branding = {
  logo: <img src="/logo192.png" alt="Ticket App Logo" style={{ height: 24 }} />,
  title: 'Ticket Booking',
};

const DEFAULT_PROVIDERS: AuthProvider[] = [
  { id: 'credentials', name: 'Credentials' },
];

export default function LoginForm({
  branding = DEFAULT_BRANDING,
  providers = DEFAULT_PROVIDERS,
  signIn,
  darkMode = false,
  emailAutoFocus = true,
  validate = true,
  title,
  bottomLink,
}: LoginFormProps) {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const isButtonDisabled = !email.trim() || !password.trim();

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }),
    [darkMode]
  );

  const CustomTitle = React.useCallback(
    () =>
      title ? (
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          className="custom-login-title"
          sx={{ color: darkMode ? '#fff' : '#000', mb: 1 }}
        >
          {title}
        </Typography>
      ) : null,
    [title, darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <GlobalStyles
        styles={{
          '.MuiTypography-h5:not(.custom-login-title)': {
            display: 'none !important',
          },
          '.MuiFormLabel-asterisk': {
            display: 'none !important',
          },
          '.MuiButton-root[type="submit"]': {
            fontSize: '0 !important',
            '&::after': {
              content: '"Login In"',
              fontSize: '14px',
            },
          },
          '.MuiTypography-body2': {
            display: 'none !important',
          },
        }}
      />

      {/* 👈 Relative wrapper so we can absolutely position the link */}
      <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <AppProvider branding={branding} theme={theme}>
          <SignInPage
            signIn={signIn}
            providers={providers}
            slots={{
              title: CustomTitle,
            }}
            slotProps={{
              emailField: {
                autoFocus: emailAutoFocus,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
                label: 'Email',
                placeholder: 'Enter Your E-Mail',
                required: true,
              },
              passwordField: {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
                label: 'Password',
                placeholder: 'Enter Your Password',
                required: true,
              },
              form: { noValidate: !validate },
              submitButton: { disabled: isButtonDisabled },
            }}
          />
        </AppProvider>

        {/* 👈 Absolutely positioned inside the card near the bottom */}
        {bottomLink && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '32px',
              width: '100%',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <Link
              href={bottomLink.href}
              underline="hover"
              sx={{
                color: darkMode ? '#90caf9' : '#1976d2',
                fontSize: '14px',
              }}
            >
              {bottomLink.text}
            </Link>
          </Box>
        )}

      </Box>

    </ThemeProvider>
  );
}