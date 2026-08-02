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
import { useAppDispatch } from '../../redux/hooks';
import { showAlert } from '../../redux/slice/alert';
import { useCreateUserMutation } from '../../redux/slice/usersOperations';
import { useCreateOrganizerMutation } from '../../redux/slice/organizerOperations';

const DARK_MODE = false;

/**
 * Slide transition wrapper component driving the entry animations 
 * for the structural sign-up dialog container.
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ViewType = 'user' | 'organizer';

/**
 * Property interface definitions detailing visibility metrics, 
 * initial dashboard views, and modal transition toggles.
 */
interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: ViewType;
  onSwitchToLogin?: () => void;
}

/**
 * SignUpModal manages registration workflows for both standard consumers 
 * and platform event organizers, handling separate asynchronous RTK-Query mutations,
 * validation tracking, and token management.
 */
export default function SignUpModal({
  open,
  onClose,
  initialView = 'user',
  onSwitchToLogin,
}: SignUpModalProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [view, setView] = React.useState<ViewType>(initialView);

  const [createUser, { isLoading: userLoading, isSuccess: userSuccess, isError: userIsError, data: userData, error: userError }] = useCreateUserMutation();
  const [createOrganizer, { isLoading: orgLoading, isSuccess: orgSuccess, isError: orgIsError, data: orgData, error: orgError }] = useCreateOrganizerMutation();

  const [name, setName]                 = React.useState('');
  const [email, setEmail]               = React.useState('');
  const [password, setPassword]         = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [formError, setFormError]       = React.useState('');

  const isLoading = view === 'user' ? userLoading : orgLoading;

  const passwordsMatch = password === confirmPassword;
  const confirmPasswordError = !!confirmPassword && !passwordsMatch;

  const isButtonDisabled =
    !name.trim() ||
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    !passwordsMatch ||
    isLoading;

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

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

  React.useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormError('');
    setView(initialView);
  }, [open, initialView]);

  React.useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormError('');
  }, [view]);

  React.useEffect(() => {
    if (userSuccess && userData?.success) {
      localStorage.setItem('token', userData.authtoken);
      dispatch(showAlert({ message: 'Account created! Welcome.', severity: 'success' }));
      onClose();
      window.location.reload();
    }
  }, [userSuccess, userData, dispatch, onClose]);

  React.useEffect(() => {
    if (orgSuccess && orgData?.success) {
      const token = orgData.authToken || orgData.authtoken;
      localStorage.setItem('token', token);
      dispatch(showAlert({ message: 'Organizer account created!', severity: 'success' }));
      onClose();
      navigate('/organizershome');
    }
  }, [orgSuccess, orgData, dispatch, onClose, navigate]);

  React.useEffect(() => {
    if (userIsError) {
      const errMsg =
        (userError as any)?.data?.error ||
        (userError as any)?.data?.message ||
        'Signup failed. Please try again.';
      setFormError(errMsg);
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  }, [userIsError, userError, dispatch]);

  React.useEffect(() => {
    if (orgIsError) {
      const errMsg =
        (orgError as any)?.data?.error ||
        (orgError as any)?.data?.message ||
        'Signup failed. Please try again.';
      setFormError(errMsg);
      dispatch(showAlert({ message: errMsg, severity: 'error' }));
    }
  }, [orgIsError, orgError, dispatch]);

  /**
   * Handles multi-step form submissions, enforcing parameter checks, 
   * length allocations, and matching parameters before dispatching mutations.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }

    if (!passwordsMatch) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (view === 'user') {
        await createUser({ name, email, password }).unwrap();
      } else {
        await createOrganizer({ name, email, password }).unwrap();
      }
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || 'Signup failed.';
      setFormError(message);
    }
  };

  /**
   * Closes the active register footprint context and invokes parent links
   * to immediately present authentication screens.
   */
  const handleSwitchToLogin = () => {
    onClose();
    onSwitchToLogin?.();
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
            bgcolor: colors.bg,
            px: 1,
            pb: 3,
            boxShadow: DARK_MODE
              ? '0 8px 32px rgba(0,0,0,0.8)'
              : '0 8px 32px rgba(0,0,0,0.15)',
          },
        }}
      >
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

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <img src="/logo192.png" alt="Logo" style={{ height: 32 }} />
          </Box>

          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: colors.text, mb: 0.5 }}
          >
            {view === 'user' ? 'Create Account' : 'Organizer Sign Up'}
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: colors.subtext, mb: 3 }}
          >
            {view === 'user'
              ? 'Sign up to start booking tickets'
              : 'Sign up to start hosting events'}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Name"
              type="text"
              required
              fullWidth
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
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

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
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

            <TextField
              label="Confirm Password"
              type="password"
              required
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter Your Password"
              variant="outlined"
              size="small"
              error={confirmPasswordError}
              helperText={confirmPasswordError ? 'Passwords do not match' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: colors.border },
                },
                '& .MuiInputLabel-root': { color: colors.subtext },
                '& .MuiInputBase-input': { color: colors.text },
              }}
            />

            {formError && (
              <Typography variant="body2" color="error" textAlign="center">
                {formError}
              </Typography>
            )}

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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <Divider sx={{ borderColor: colors.divider }} />

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={handleSwitchToLogin}
                sx={{
                  color: colors.link,
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                Already have an account? Sign In
              </Link>
            </Box>

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
                  Click here for Organizer Sign Up
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
                  Click here for User Sign Up
                </Link>
              )}
            </Box>

          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}