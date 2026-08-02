import React from 'react';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Typography,
  CircularProgress,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import EventDetailCard, { type EventDetail } from '../UI Components/ShowCard';
import ShowDetailsModal from '../UI Components/Modals/ShowDetailsModal';
import CancelTicketModal from '../UI Components/Modals/CancelTicketModal';
import { useGetUserTicketsQuery, useCancelTicketMutation } from '../redux/slice/usersOperations';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';

const DARK_MODE = false;

/**
 * Transforms a raw user ticket object payload into the structured interface contract
 * expected by the presentation layer layouts, adapting pricing structures and localized dates.
 */
const mapTicketToEventDetail = (ticket: any): EventDetail => ({
  event_id:          ticket.ticket_id,
  event_name:        ticket.event_name,
  event_city:        ticket.venue_address?.city || 'N/A',
  event_description: `Booking ID: ${ticket.ticket_id}`,
  release_date:      new Date(ticket.show_date).toLocaleDateString('en-IN', {
                       day: '2-digit', month: 'short', year: 'numeric'
                     }),
  duration:          `${ticket.number_of_tickets} Ticket${ticket.number_of_tickets > 1 ? 's' : ''}`,
  genres:            [`Total Paid: ₹${ticket.total_price}`],
  formats:           [
                       `Show Time: ${new Date(ticket.show_date).toLocaleDateString('en-IN', {
                         weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                       })}${ticket.show_time ? ` • ${ticket.show_time}` : ''}`,
                       `Booked on: ${new Date(ticket.date_booked).toLocaleDateString()}`,
                     ],
  image_url:         ticket.image_url || undefined,
  interested_count:  undefined,
});

/**
 * Determines whether the specified ticket's target show schedule has already elapsed 
 * based on current system timezone calculations.
 */
const isTicketPast = (ticket: any): boolean => {
  const showDateTime = ticket.show_time
    ? new Date(`${ticket.show_date}T${ticket.show_time}:00`)
    : new Date(`${ticket.show_date}T23:59:59`);
  return showDateTime < new Date();
};

/**
 * User_Tickets serves as the personal booking hub dashboard viewport, handling stateful tracking 
 * for active and historical vouchers, split tab partitions, and cancellation workflows.
 */
export default function User_Tickets() {
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  const dispatch = useAppDispatch();

  const { data, isLoading, isError } = useGetUserTicketsQuery();
  const [cancelTicket, { isLoading: isCancelling }] = useCancelTicketMutation();

  const tickets = data?.userTickets || [];

  const [tab, setTab] = React.useState<'upcoming' | 'past'>('upcoming');

  const upcomingTickets = tickets.filter((t: any) => !isTicketPast(t));
  const pastTickets     = tickets.filter((t: any) =>  isTicketPast(t));
  const displayedTickets = tab === 'upcoming' ? upcomingTickets : pastTickets;

  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket]     = React.useState<any>(null);

  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [ticketToCancel, setTicketToCancel]   = React.useState<any>(null);

  const handleShowDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailsModalOpen(true);
  };

  const handleOpenCancelModal = (ticket: any) => {
    setTicketToCancel(ticket);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!ticketToCancel) return;

    try {
      await cancelTicket({ ticket_id: ticketToCancel.ticket_id }).unwrap();
      dispatch(showAlert({ message: 'Ticket cancelled successfully.', severity: 'success' }));
      setCancelModalOpen(false);
      setTicketToCancel(null);
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || 'Failed to cancel ticket.';
      dispatch(showAlert({ message, severity: 'error' }));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: DARK_MODE ? '#121212' : '#f5f5f5' }}>

        <Box sx={{ px: { xs: 3, md: 5 }, py: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            My Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All your booked tickets in one place
          </Typography>

          <Box sx={{ mt: 2 }}>
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={(_, val) => { if (val) setTab(val); }}
              size="small"
              sx={{
                bgcolor: DARK_MODE ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderRadius: 2,
                p: 0.5,
                gap: 0.5,
              }}
            >
              <ToggleButton
                value="upcoming"
                disableRipple
                sx={{
                  border: 'none',
                  borderRadius: '6px !important',
                  px: 3,
                  py: 0.8,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  '&.Mui-selected': {
                    bgcolor: '#e91e63',
                    color: '#fff',
                    '&:hover': { bgcolor: '#c2185b' },
                  },
                  '&:hover': {
                    bgcolor: DARK_MODE ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                }}
              >
                Upcoming
                {upcomingTickets.length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.8,
                      py: 0.1,
                      bgcolor: tab === 'upcoming' ? 'rgba(255,255,255,0.3)' : '#e91e63',
                      color: '#fff',
                      borderRadius: 10,
                      fontSize: '11px',
                      fontWeight: 700,
                      lineHeight: '18px',
                      minWidth: 18,
                      display: 'inline-block',
                      textAlign: 'center',
                    }}
                  >
                    {upcomingTickets.length}
                  </Box>
                )}
              </ToggleButton>

              <ToggleButton
                value="past"
                disableRipple
                sx={{
                  border: 'none',
                  borderRadius: '6px !important',
                  px: 3,
                  py: 0.8,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  '&.Mui-selected': {
                    bgcolor: '#e91e63',
                    color: '#fff',
                    '&:hover': { bgcolor: '#c2185b' },
                  },
                  '&:hover': {
                    bgcolor: DARK_MODE ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                }}
              >
                Past
                {pastTickets.length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.8,
                      py: 0.1,
                      bgcolor: tab === 'past' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                      color: tab === 'past' ? '#fff' : 'rgba(0,0,0,0.5)',
                      borderRadius: 10,
                      fontSize: '11px',
                      fontWeight: 700,
                      lineHeight: '18px',
                      minWidth: 18,
                      display: 'inline-block',
                      textAlign: 'center',
                    }}
                  >
                    {pastTickets.length}
                  </Box>
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography color="error">Failed to load tickets.</Typography>
          </Box>
        )}

        {!isLoading && !isError && displayedTickets.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
            {tab === 'upcoming' ? (
              <>
                <Typography variant="h6">No upcoming tickets</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Browse events and book your first ticket!
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6">No past tickets</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tickets for shows that have already passed will appear here.
                </Typography>
              </>
            )}
          </Box>
        )}

        {!isLoading && displayedTickets.map((ticket: any) => (
          <Box
            key={ticket.ticket_id}
            sx={{
              mx: { xs: 2, md: 5 },
              mb: 3,
              bgcolor: DARK_MODE ? '#1e1e1e' : '#fff',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: DARK_MODE ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              opacity: tab === 'past' ? 0.75 : 1,
            }}
          >
            <EventDetailCard
              event={mapTicketToEventDetail(ticket)}
              darkMode={DARK_MODE}
              actions={
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleShowDetails(ticket)}
                    sx={{
                      bgcolor: '#e91e63',
                      color: '#fff',
                      px: 4,
                      py: 1.2,
                      fontWeight: 'bold',
                      borderRadius: 1,
                      '&:hover': { bgcolor: '#c2185b' },
                    }}
                  >
                    Show Details
                  </Button>
                  {tab === 'upcoming' && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenCancelModal(ticket)}
                      sx={{ px: 4, py: 1.2, fontWeight: 'bold', borderRadius: 1 }}
                    >
                      Cancel Ticket
                    </Button>
                  )}
                </Stack>
              }
            />
          </Box>
        ))}

        <ShowDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          ticket={selectedTicket}
        />

        <CancelTicketModal
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          eventName={ticketToCancel?.event_name}
          numberOfTickets={ticketToCancel?.number_of_tickets}
          isLoading={isCancelling}
        />

      </Box>
    </ThemeProvider>
  );
}