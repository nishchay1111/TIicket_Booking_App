import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';

const DARK_MODE = false;

/**
 * Slide transition wrapper component driving the entry animations 
 * for the structural dialog modal container.
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Property interface definitions detailing the state visibility, item metadata,
 * and cancellation triggers for CancelTicketModal.
 */
interface CancelTicketModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName?: string;
  numberOfTickets?: number;
  isLoading?: boolean;
}

/**
 * CancelTicketModal renders a binary confirmation overlay notifying the user
 * of destructive actions, ticket inventory rollbacks, and non-reversible states.
 */
export default function CancelTicketModal({
  open,
  onClose,
  onConfirm,
  eventName,
  numberOfTickets,
  isLoading = false,
}: CancelTicketModalProps) {
  const colors = {
    bg:       DARK_MODE ? '#1a1a2e'               : '#ffffff',
    text:     DARK_MODE ? '#ffffff'               : '#000000',
    subtext:  DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    border:   DARK_MODE ? 'rgba(255,255,255,0.15)': 'rgba(0,0,0,0.1)',
    closeBtn: DARK_MODE ? '#ffffff'               : '#000000',
  };

  return (
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
        sx={{ position: 'absolute', right: 8, top: 8, color: colors.closeBtn }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 5, textAlign: 'center' }}>

        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(211,47,47,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <WarningAmberIcon sx={{ color: '#d32f2f', fontSize: 34 }} />
        </Box>

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: colors.text, mb: 1 }}
        >
          Cancel this ticket?
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: colors.subtext, mb: 3, px: 1 }}
        >
          {eventName ? (
            <>
              You're about to cancel {numberOfTickets ? `${numberOfTickets} ` : ''}
              ticket{numberOfTickets && numberOfTickets > 1 ? 's' : ''} for{' '}
              <Box component="span" sx={{ fontWeight: 700, color: colors.text }}>
                {eventName}
              </Box>
              . This action cannot be undone.
            </>
          ) : (
            'This action cannot be undone.'
          )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
            sx={{
              py: 1.2,
              fontWeight: 600,
              borderColor: colors.border,
              color: colors.text,
              '&:hover': { borderColor: colors.border, bgcolor: 'rgba(0,0,0,0.03)' },
            }}
          >
            Keep Ticket
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            disabled={isLoading}
            onClick={onConfirm}
            sx={{
              py: 1.2,
              fontWeight: 600,
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' },
            }}
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </Box>

      </DialogContent>
    </Dialog>
  );
}