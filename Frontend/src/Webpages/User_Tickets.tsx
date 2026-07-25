import React from 'react';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Typography,
  CircularProgress,
} from '@mui/material';
import EventDetailCard, { type EventDetail } from '../UI Components/ShowCard';
import { useGetUserTicketsQuery } from '../redux/slice/usersOperations';

// ─── 🌙 Toggle Dark Mode ──────────────────────────────────────────────────────
const DARK_MODE = false;

// ─── Helper — map ticket data to EventDetail shape ───────────────────────────
const mapTicketToEventDetail = (ticket: any): EventDetail => ({
  event_id:          ticket.ticket_id,
  event_name:        ticket.event_name,
  event_city:        ticket.event_location || 'N/A',
  event_description: `Booking ID: ${ticket.ticket_id}`,
  release_date:      new Date(ticket.show_date).toLocaleDateString('en-IN', {
                       day: '2-digit', month: 'short', year: 'numeric'
                     }),
  duration:          `${ticket.number_of_tickets} Ticket${ticket.number_of_tickets > 1 ? 's' : ''}`,
  genres:            [`Total Paid: ₹${ticket.total_price}`],
  formats:           [`Booked on: ${new Date(ticket.date_booked).toLocaleDateString()}`],
  image_url:         ticket.image_url || undefined,
  interested_count:  undefined, // 👈 hides the interested section
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function User_Tickets() {
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  const { data, isLoading, isError } = useGetUserTicketsQuery();

  const tickets = data?.userTickets || [];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: DARK_MODE ? '#121212' : '#f5f5f5' }}>

        {/* ── Page Header ───────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 3, md: 5 }, py: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            My Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All your booked tickets in one place
          </Typography>
        </Box>

        {/* ── Loading State ─────────────────────────────────────────── */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {/* ── Error State ───────────────────────────────────────────── */}
        {isError && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography color="error">Failed to load tickets.</Typography>
          </Box>
        )}

        {/* ── Empty State ───────────────────────────────────────────── */}
        {!isLoading && !isError && tickets.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              mt: 10,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6">🎟️ No tickets booked yet</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Browse events and book your first ticket!
            </Typography>
          </Box>
        )}

        {/* ── Tickets List ──────────────────────────────────────────── */}
        {!isLoading && tickets.map((ticket: any) => (
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
            }}
          >
            <EventDetailCard
              event={mapTicketToEventDetail(ticket)}
              darkMode={DARK_MODE}
              onBookTickets={() => console.log('View E-Ticket:', ticket.ticket_id)}
            />
          </Box>
        ))}

      </Box>
    </ThemeProvider>
  );
}