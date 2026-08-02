import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Box,
  Button,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { showAlert } from '../../redux/slice/alert';
import { useBookTicketMutation } from '../../redux/slice/usersOperations';

const DARK_MODE = false;

/**
 * Slide transition wrapper component driving the entry animations 
 * for the multi-step checkout dialog container.
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
 * Shape definition for show listings consumed by the ticketing pipeline.
 */
interface RawShow {
  show_id: string;
  venue_name: string;
  venue_address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  show_date: string;
  show_time: string;
  screen?: string | null;
  show_language: string;
  total_tickets: number;
  available_tickets: number;
  ticket_price: number;
  active?: boolean;
}

/**
 * Shape definition representing event records populated with child schedules.
 */
interface RawEvent {
  event_id: string;
  event_name: string;
  shows?: RawShow[];
}

/**
 * Property interface definitions detailing the state visibility and tracking 
 * requirements for BookTicketModal.
 */
interface BookTicketModalProps {
  open: boolean;
  onClose: () => void;
  event: RawEvent | null;
}

type Step = 'city' | 'date' | 'venue' | 'confirm';

/**
 * BookTicketModal provides a wizard-driven user interface stepping through geolocation, 
 * date selection, calendar timeline grids, seat configurations, and real-time ledger bookings.
 */
export default function BookTicketModal({
  open,
  onClose,
  event,
}: BookTicketModalProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [bookTicket, { isLoading }] = useBookTicketMutation();

  const [step, setStep]                 = React.useState<Step>('city');
  const [selectedCity, setSelectedCity] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedShow, setSelectedShow] = React.useState<RawShow | null>(null);
  const [quantity, setQuantity]         = React.useState(1);
  const [formError, setFormError]       = React.useState('');

  const colors = {
    bg:        DARK_MODE ? '#1a1a2e'               : '#ffffff',
    text:      DARK_MODE ? '#ffffff'               : '#000000',
    subtext:   DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    border:    DARK_MODE ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    cardBg:    DARK_MODE ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.02)',
    cardHover: DARK_MODE ? 'rgba(255,255,255,0.1)' : 'rgba(233,30,99,0.06)',
    accent:    '#e91e63',
    closeBtn:  DARK_MODE ? '#ffffff'               : '#000000',
  };

  React.useEffect(() => {
    if (!open) return;
    setStep('city');
    setSelectedCity(null);
    setSelectedDate(null);
    setSelectedShow(null);
    setQuantity(1);
    setFormError('');
  }, [open, event?.event_id]);

  const activeShows = React.useMemo(
    () => (event?.shows || []).filter(
      (s) => s.active !== false && s.available_tickets > 0
    ),
    [event]
  );

  const cities = React.useMemo(() => {
    const set = new Set(
      activeShows.map((s) => s.venue_address?.city).filter(Boolean) as string[]
    );
    return Array.from(set);
  }, [activeShows]);

  const datesForCity = React.useMemo(() => {
    if (!selectedCity) return [];
    const set = new Set(
      activeShows
        .filter((s) => s.venue_address?.city === selectedCity)
        .map((s) => s.show_date)
    );
    return Array.from(set).sort();
  }, [activeShows, selectedCity]);

  const showsForDate = React.useMemo(() => {
    if (!selectedCity || !selectedDate) return [];
    return activeShows
      .filter(
        (s) => s.venue_address?.city === selectedCity && s.show_date === selectedDate
      )
      .sort((a, b) => a.show_time.localeCompare(b.show_time));
  }, [activeShows, selectedCity, selectedDate]);

  const maxQuantity = selectedShow ? Math.min(selectedShow.available_tickets, 10) : 1;
  const totalPrice  = selectedShow ? selectedShow.ticket_price * quantity : 0;

  /**
   * Rewinds the wizard tracking state backward by one layout tier 
   * while cleaning out historical tier inputs.
   */
  const goBack = () => {
    setFormError('');
    if (step === 'date')    { setStep('city'); setSelectedCity(null); }
    if (step === 'venue')   { setStep('date'); setSelectedDate(null); }
    if (step === 'confirm') { setStep('venue'); setSelectedShow(null); setQuantity(1); }
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setStep('date');
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setStep('venue');
  };

  const handleSelectShow = (show: RawShow) => {
    setSelectedShow(show);
    setQuantity(1);
    setStep('confirm');
  };

  /**
   * Finalizes the ticket allocation transaction by passing records to the API layer,
   * firing status micro-alerts, and re-routing users to their active itineraries.
   */
  const handleConfirmBooking = async () => {
    if (!selectedShow) return;
    setFormError('');

    try {
      await bookTicket({
        showId: selectedShow.show_id,
        numberOfTickets: quantity,
      }).unwrap();

      dispatch(showAlert({ message: 'Ticket booked successfully!', severity: 'success' }));
      onClose();
      navigate('/user_tickets');
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || 'Booking failed. Please try again.';
      setFormError(message);
      dispatch(showAlert({ message, severity: 'error' }));
    }
  };

  const stepTitles: Record<Step, string> = {
    city:    'Select City',
    date:    'Select Date',
    venue:   'Select Venue & Showtime',
    confirm: 'Confirm Booking',
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
      {step !== 'city' && (
        <IconButton
          onClick={goBack}
          sx={{ position: 'absolute', left: 8, top: 8, color: colors.closeBtn }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}

      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: colors.closeBtn }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 5 }}>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: colors.subtext, mb: 0.5 }}
        >
          {event?.event_name}
        </Typography>

        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          sx={{ color: colors.text, mb: 3 }}
        >
          {stepTitles[step]}
        </Typography>

        {step === 'city' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {cities.length === 0 && (
              <Typography sx={{ color: colors.subtext, textAlign: 'center' }}>
                No shows currently available for this event.
              </Typography>
            )}
            {cities.map((city) => (
              <Button
                key={city}
                onClick={() => handleSelectCity(city)}
                startIcon={<LocationOnIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: colors.cardBg,
                  color: colors.text,
                  textTransform: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: `1px solid ${colors.border}`,
                  '&:hover': { bgcolor: colors.cardHover },
                }}
              >
                {city}
              </Button>
            ))}
          </Box>
        )}

        {step === 'date' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {datesForCity.map((date) => (
              <Button
                key={date}
                onClick={() => handleSelectDate(date)}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: colors.cardBg,
                  color: colors.text,
                  textTransform: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: `1px solid ${colors.border}`,
                  '&:hover': { bgcolor: colors.cardHover },
                }}
              >
                {new Date(date).toLocaleDateString('en-IN', {
                  weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                })}
              </Button>
            ))}
          </Box>
        )}

        {step === 'venue' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {showsForDate.map((show) => (
              <Box
                key={show.show_id}
                onClick={() => handleSelectShow(show)}
                sx={{
                  cursor: 'pointer',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  '&:hover': { bgcolor: colors.cardHover },
                }}
              >
                <Typography fontWeight="bold" sx={{ color: colors.text }}>
                  {show.venue_name}
                  {show.screen ? ` • Screen ${show.screen}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.subtext, mt: 0.5 }}>
                  {show.show_time} • {show.show_language}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip
                    label={`${show.available_tickets} seats left`}
                    size="small"
                    sx={{
                      bgcolor: show.available_tickets < 20 ? '#fdecea' : '#e8f5e9',
                      color: show.available_tickets < 20 ? '#c62828' : '#2e7d32',
                      fontWeight: 600,
                    }}
                  />
                  <Typography fontWeight="bold" sx={{ color: colors.accent }}>
                    ₹{show.ticket_price}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {step === 'confirm' && selectedShow && (
          <Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                mb: 3,
              }}
            >
              <Typography fontWeight="bold" sx={{ color: colors.text }}>
                {selectedShow.venue_name}
                {selectedShow.screen ? ` • Screen ${selectedShow.screen}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.subtext, mt: 0.5 }}>
                {new Date(selectedShow.show_date).toLocaleDateString('en-IN', {
                  weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                })} • {selectedShow.show_time}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.subtext }}>
                {selectedCity} • {selectedShow.show_language}
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}>
              <Typography sx={{ color: colors.text, fontWeight: 600 }}>
                Number of Tickets
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  size="small"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  sx={{ border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ color: colors.text, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  disabled={quantity >= maxQuantity}
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  sx={{ border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ borderColor: colors.border, mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                Total
              </Typography>
              <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: '18px' }}>
                ₹{totalPrice.toFixed(2)}
              </Typography>
            </Box>

            {formError && (
              <Typography variant="body2" color="error" textAlign="center" sx={{ mb: 2 }}>
                {formError}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              disabled={isLoading}
              onClick={handleConfirmBooking}
              sx={{
                py: 1.3,
                bgcolor: colors.accent,
                fontWeight: 'bold',
                fontSize: '15px',
                '&:hover': { bgcolor: '#c2185b' },
              }}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
}