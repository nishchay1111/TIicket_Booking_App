import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';

const DARK_MODE = false;

/**
 * Slide transition wrapper component driving the entry animations 
 * for the structural administrative dialog container.
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Step = 'menu' | 'delete' | 'cancelShow' | 'addShow';

/**
 * Property interface definitions detailing the structural event payload data,
 * state visibility tracking, and mutating async callback handlers.
 */
interface ModifyEventModalProps {
  open: boolean;
  onClose: () => void;
  event: any | null;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onCancelShow: (eventId: string, showId: string) => Promise<void>;
  onAddShow: (eventId: string, showData: any) => Promise<void>;
  isDeleting?: boolean;
  isCancelling?: boolean;
  isAdding?: boolean;
}

/**
 * ModifyEventModal provides a multi-view management workspace for administrators
 * to remove scheduled listings, cancel individual child showtimes, or expand 
 * available itineraries with dynamic venue information.
 */
export default function ModifyEventModal({
  open,
  onClose,
  event,
  onDeleteEvent,
  onCancelShow,
  onAddShow,
  isDeleting = false,
  isCancelling = false,
  isAdding = false,
}: ModifyEventModalProps) {
  const [step, setStep] = React.useState<Step>('menu');
  const [selectedShowId, setSelectedShowId] = React.useState('');
  const [formError, setFormError] = React.useState('');

  const [venueName, setVenueName]           = React.useState('');
  const [street, setStreet]                 = React.useState('');
  const [city, setCity]                     = React.useState('');
  const [state, setState]                   = React.useState('');
  const [zip, setZip]                       = React.useState('');
  const [showDate, setShowDate]             = React.useState('');
  const [showTime, setShowTime]             = React.useState('');
  const [showLanguage, setShowLanguage]     = React.useState('');
  const [totalTickets, setTotalTickets]     = React.useState('');
  const [ticketPrice, setTicketPrice]       = React.useState('');

  const colors = {
    bg:        DARK_MODE ? '#1a1a2e'               : '#ffffff',
    text:      DARK_MODE ? '#ffffff'               : '#000000',
    subtext:   DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    border:    DARK_MODE ? 'rgba(255,255,255,0.15)': 'rgba(0,0,0,0.1)',
    cardBg:    DARK_MODE ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.02)',
    accent:    '#e91e63',
  };

  React.useEffect(() => {
    if (!open) return;
    setStep('menu');
    setSelectedShowId('');
    setFormError('');
    setVenueName('');
    setStreet('');
    setCity('');
    setState('');
    setZip('');
    setShowDate('');
    setShowTime('');
    setShowLanguage('');
    setTotalTickets('');
    setTicketPrice('');
  }, [open, event?.event_id]);

  if (!event) return null;

  const shows = event.shows || [];
  const activeShows = shows.filter((s: any) => s.active !== false);

  /**
   * Triggers the comprehensive parent elimination procedure, executing the API mutation 
   * block and clearing dialogue state closures upon a successful request lifecycle.
   */
  const handleDeleteConfirm = async () => {
    setFormError('');
    try {
      await onDeleteEvent(event.event_id);
      onClose();
    } catch (err: any) {
      setFormError(err?.data?.error || err?.data?.message || 'Failed to delete event.');
    }
  };

  /**
   * Dispatches cancellation parameters for targeted child show items based on localized
   * selection records, then cascades back to the standard menu overlay.
   */
  const handleCancelShowConfirm = async () => {
    if (!selectedShowId) {
      setFormError('Please select a show to cancel.');
      return;
    }
    setFormError('');
    try {
      await onCancelShow(event.event_id, selectedShowId);
      setStep('menu');
      setSelectedShowId('');
    } catch (err: any) {
      setFormError(err?.data?.error || err?.data?.message || 'Failed to cancel show.');
    }
  };

  /**
   * Validates form parameters, marshals relational structure payloads, and fires the append operations
   * to register supplementary shows for the designated event context.
   */
  const handleAddShowSubmit = async () => {
    if (!venueName || !showDate || !showTime || !totalTickets || !ticketPrice) {
      setFormError('Please fill in venue, date, time, tickets, and price.');
      return;
    }
    setFormError('');
    try {
      await onAddShow(event.event_id, {
        venue_name: venueName,
        venue_address: { street, city, state, zip },
        show_date: showDate,
        show_time: showTime,
        show_language: showLanguage || 'English',
        total_tickets: Number(totalTickets),
        available_tickets: Number(totalTickets),
        ticket_price: Number(ticketPrice),
      });
      setStep('menu');
    } catch (err: any) {
      setFormError(err?.data?.error || err?.data?.message || 'Failed to add show.');
    }
  };

  /**
   * Resets active validation error messaging states while popping the navigation tracker
   * backward to the initial dashboard management options block.
   */
  const goBack = () => {
    setFormError('');
    setStep('menu');
  };

  const stepTitles: Record<Step, string> = {
    menu:        'Modify Event',
    delete:      'Delete Event',
    cancelShow:  'Cancel a Show',
    addShow:     'Add a New Show',
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
      }}
    >
      {step !== 'menu' && (
        <IconButton onClick={goBack} sx={{ position: 'absolute', left: 8, top: 8, color: colors.text }}>
          <ArrowBackIcon />
        </IconButton>
      )}

      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: colors.text }}>
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 5 }}>

        <Typography variant="body2" textAlign="center" sx={{ color: colors.subtext, mb: 0.5 }}>
          {event.event_name}
        </Typography>
        <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ color: colors.text, mb: 3 }}>
          {stepTitles[step]}
        </Typography>

        {formError && (
          <Typography variant="body2" color="error" textAlign="center" sx={{ mb: 2 }}>
            {formError}
          </Typography>
        )}

        {step === 'menu' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              fullWidth
              startIcon={<DeleteIcon />}
              onClick={() => setStep('delete')}
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                color: '#c62828',
                textTransform: 'none',
                fontWeight: 600,
                border: `1px solid ${colors.border}`,
                '&:hover': { bgcolor: 'rgba(198,40,40,0.08)' },
              }}
            >
              Delete Event
            </Button>

            <Button
              fullWidth
              startIcon={<EventBusyIcon />}
              onClick={() => setStep('cancelShow')}
              disabled={activeShows.length === 0}
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                color: colors.text,
                textTransform: 'none',
                fontWeight: 600,
                border: `1px solid ${colors.border}`,
                '&:hover': { bgcolor: 'rgba(233,30,99,0.06)' },
              }}
            >
              Cancel Show
            </Button>

            <Button
              fullWidth
              startIcon={<AddCircleIcon />}
              onClick={() => setStep('addShow')}
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                color: colors.text,
                textTransform: 'none',
                fontWeight: 600,
                border: `1px solid ${colors.border}`,
                '&:hover': { bgcolor: 'rgba(233,30,99,0.06)' },
              }}
            >
              Add Shows
            </Button>
          </Box>
        )}

        {step === 'delete' && (
          <Box>
            <Typography sx={{ color: colors.subtext, textAlign: 'center', mb: 3 }}>
              This will permanently delete <strong>{event.event_name}</strong> and all
              of its shows. This action cannot be undone.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="error"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              sx={{ py: 1.2, fontWeight: 600 }}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Event'}
            </Button>
          </Box>
        )}

        {step === 'cancelShow' && (
          <Box>
            <TextField
              select
              fullWidth
              label="Select Show"
              value={selectedShowId}
              onChange={(e) => setSelectedShowId(e.target.value)}
              size="small"
              sx={{ mb: 3 }}
            >
              {activeShows.map((show: any) => (
                <MenuItem key={show.show_id} value={show.show_id}>
                  {show.venue_name} — {new Date(show.show_date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })} • {show.show_time}
                </MenuItem>
              ))}
            </TextField>
            <Button
              fullWidth
              variant="contained"
              color="error"
              disabled={isCancelling || !selectedShowId}
              onClick={handleCancelShowConfirm}
              sx={{ py: 1.2, fontWeight: 600 }}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel This Show'}
            </Button>
          </Box>
        )}

        {step === 'addShow' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Venue Name" size="small" fullWidth required
              value={venueName} onChange={(e) => setVenueName(e.target.value)} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Street" size="small" fullWidth
                value={street} onChange={(e) => setStreet(e.target.value)} />
              <TextField label="City" size="small" fullWidth
                value={city} onChange={(e) => setCity(e.target.value)} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="State" size="small" fullWidth
                value={state} onChange={(e) => setState(e.target.value)} />
              <TextField label="Zip" size="small" fullWidth
                value={zip} onChange={(e) => setZip(e.target.value)} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Show Date" type="date" size="small" fullWidth required
                InputLabelProps={{ shrink: true }}
                value={showDate} onChange={(e) => setShowDate(e.target.value)}
              />
              <TextField
                label="Show Time" type="time" size="small" fullWidth required
                InputLabelProps={{ shrink: true }}
                value={showTime} onChange={(e) => setShowTime(e.target.value)}
              />
            </Box>

            <TextField label="Language" size="small" fullWidth
              value={showLanguage} onChange={(e) => setShowLanguage(e.target.value)} placeholder="English" />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Total Tickets" type="number" size="small" fullWidth required
                value={totalTickets} onChange={(e) => setTotalTickets(e.target.value)}
              />
              <TextField
                label="Ticket Price (₹)" type="number" size="small" fullWidth required
                value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              disabled={isAdding}
              onClick={handleAddShowSubmit}
              sx={{ py: 1.2, fontWeight: 600, bgcolor: colors.accent, '&:hover': { bgcolor: '#c2185b' } }}
            >
              {isAdding ? 'Adding...' : 'Add Show'}
            </Button>
          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
}