import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';
import { useLoginMutation } from '../redux/slice/usersOperations';
import { useOrganizerLoginMutation } from '../redux/slice/organizerOperations';

// ─── 🌙 Toggle Dark Mode Here ─────────────────────────────────────────────────
const DARK_MODE = false; // 👈 Change to true for dark, false for light

// ─── Slide Up Transition ──────────────────────────────────────────────────────
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── View Type ────────────────────────────────────────────────────────────────
type ViewType = 'user' | 'organizer';

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginModal({
  open,
  onClose,
}: LoginModalProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [view, setView] = React.useState<ViewType>('user');

  const [login, { isLoading: userLoading, isSuccess: userSuccess, isError: userIsError, data: userData, error: userError }] = useLoginMutation();
  const [organizerLogin, { isLoading: orgLoading, isSuccess: orgSuccess, isError: orgIsError, data: orgData, error: orgError }] = useOrganizerLoginMutation();

  // ── Form state ────────────────────────────────────────────────────────
  const [email, setEmail]         = React.useState('');
  const [password, setPassword]   = React.useState('');
  const [formError, setFormError] = React.useState('');

  const isLoading        = view === 'user' ? userLoading : orgLoading;
  const isButtonDisabled = !email.trim() || !password.trim() || isLoading;

  // ── Theme ─────────────────────────────────────────────────────────────
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  // ── Colors based on mode ──────────────────────────────────────────────
  const colors = {
    bg:          DARK_MODE ? '#1a1a2e'              : '#ffffff',
    text:        DARK_MODE ? '#ffffff'              : '#000000',
    subtext:     DARK_MODE ? 'rgba(255,255,255,0.6)': 'rgba(0,0,0,0.5)',
    border:      DARK_MODE ? 'rgba(255,255,255,0.2)': 'rgba(0,0,0,0.15)',
    btnBorder:   DARK_MODE ? 'rgba(255,255,255,0.4)': 'rgba(0,0,0,0.2)',
    btnColor:    DARK_MODE ? '#ffffff'              : '#333333',
    btnHoverBg:  DARK_MODE ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.04)',
    link:        DARK_MODE ? '#90caf9'              : '#e91e63',
    divider:     DARK_MODE ? 'rgba(255,255,255,0.1)': 'rgba(0,0,0,0.1)',
    closeBtn:    DARK_MODE ? '#ffffff'              : '#000000',
  };

  // ── Reset form when modal closes or view changes ──────────────────────
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setFormError('');
  }, [open, view]);

  // ── User Success ──────────────────────────────────────────────────────
  React.useEffect(() => {
    if (userSuccess && userData?.success) {
      localStorage.setItem('token', userData.authtoken);
      dispatch(showAlert({ message: 'Login successful! Welcome back.', severity: 'success' }));
      onClose();
      window.location.reload();
    }
  }, [userSuccess, userData, dispatch, onClose]);

  // ── Organizer Success ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (orgSuccess && orgData?.success) {
      const token = orgData.authToken || orgData.authtoken;
      localStorage.setItem('token', token);
      dispatch(showAlert({ message: 'Organizer login successful!', severity: 'success' }));
      onClose();
      navigate('/organizershome');
    }
  }, [orgSuccess, orgData, dispatch, onClose, navigate]);

  // ── User Error ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (userIsError) {
      const errMsg =
        (userError as any)?.data?.error ||
        (userError as any)?.data?.message ||
        'Login failed. Please check your credentials.';
      setFormError(errMsg);
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  }, [userIsError, userError, dispatch]);

  // ── Organizer Error ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (orgIsError) {
      const errMsg =
        (orgError as any)?.data?.error ||
        (orgError as any)?.data?.message ||
        'Organizer login failed.';
      setFormError(errMsg);
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  }, [orgIsError, orgError, dispatch]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Email and password are required.');
      return;
    }

    try {
      if (view === 'user') {
        await login({ email, password }).unwrap();
      } else {
        await organizerLogin({ email, password }).unwrap();
      }
    } catch (err: any) {
      const message =
        err?.data?.error || err?.data?.message || 'Invalid credentials.';
      setFormError(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        slots={{ transition: Transition }}
        keepMounted
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: colors.bg,       // 👈 white or dark
            px: 1,
            pb: 3,
            boxShadow: DARK_MODE
              ? '0 8px 32px rgba(0,0,0,0.8)'
              : '0 8px 32px rgba(0,0,0,0.15)', // 👈 subtle shadow in light mode
          },
        }}
      >
        <CssBaseline />

        {/* ── Close Button ────────────────────────────────────────── */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: colors.closeBtn,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ pt: 4 }}>

          {/* ── Logo ──────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <img src="/logo192.png" alt="Logo" style={{ height: 32 }} />
          </Box>

          {/* ── Title ─────────────────────────────────────────────── */}
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: colors.text, mb: 0.5 }}
          >
            {view === 'user' ? 'User Login' : 'Organizer Login'}
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: colors.subtext, mb: 3 }}
          >
            {view === 'user'
              ? 'Login to book tickets and more'
              : 'Login to manage your events'}
          </Typography>

          {/* ── Form ──────────────────────────────────────────────── */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* Email */}
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your E-Mail"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: colors.border },
                },
                '& .MuiInputLabel-root': { color: colors.subtext },
                '& .MuiInputBase-input': { color: colors.text },
              }}
            />

            {/* Password */}
            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: colors.border },
                },
                '& .MuiInputLabel-root': { color: colors.subtext },
                '& .MuiInputBase-input': { color: colors.text },
              }}
            />

            {/* Error */}
            {formError && (
              <Typography variant="body2" color="error" textAlign="center">
                {formError}
              </Typography>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              variant="outlined"
              fullWidth
              disabled={isButtonDisabled}
              sx={{
                py: 1.2,
                fontSize: '14px',
                fontWeight: 600,
                borderColor: colors.btnBorder,
                color: colors.btnColor,
                '&:hover': {
                  borderColor: colors.btnBorder,
                  bgcolor: colors.btnHoverBg,
                },
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            {/* Sign Up Button */}
            {view === 'user' && (
              <Button
                component="a"
                href="/user_signup"
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.2,
                  fontSize: '14px',
                  fontWeight: 600,
                  borderColor: colors.btnBorder,
                  color: colors.btnColor,
                  '&:hover': {
                    borderColor: colors.btnBorder,
                    bgcolor: colors.btnHoverBg,
                  },
                }}
              >
                Sign Up
              </Button>
            )}

            {/* Organizer Sign Up */}
            {view === 'organizer' && (
              <Button
                component="a"
                href="/organizer_signup"
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.2,
                  fontSize: '14px',
                  fontWeight: 600,
                  borderColor: colors.btnBorder,
                  color: colors.btnColor,
                  '&:hover': {
                    borderColor: colors.btnBorder,
                    bgcolor: colors.btnHoverBg,
                  },
                }}
              >
                Organizer Sign Up
              </Button>
            )}

            <Divider sx={{ borderColor: colors.divider }} />

            {/* Terms */}
            <Typography
              variant="caption"
              textAlign="center"
              sx={{ color: colors.subtext }}
            >
              By continuing, you agree to our{' '}
              <Link href="#" sx={{ color: colors.link }}>Terms & Conditions</Link>
              {' '}and{' '}
              <Link href="#" sx={{ color: colors.link }}>Privacy Policy</Link>
            </Typography>

            {/* Switch view link */}
            <Box sx={{ textAlign: 'center' }}>
              {view === 'user' ? (
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => setView('organizer')}
                  sx={{
                    color: colors.link,
                    fontSize: '14px',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  Click here for Organizer Login
                </Link>
              ) : (
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => setView('user')}
                  sx={{
                    color: colors.link,
                    fontSize: '14px',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  Click here for User Login
                </Link>
              )}
            </Box>

          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}