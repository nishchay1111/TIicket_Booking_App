import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, createTheme, CircularProgress, Typography } from '@mui/material';
import EventDetailHero from '../UI Components/ShowBannerBackground';
import EventDetailCard, { type EventDetail } from '../UI Components/ShowCard';
import { useFetchEventByIdQuery } from '../redux/slice/usersOperations';

// ─── Helper — map raw API event to EventDetail shape ─────────────────────────
const mapApiEventToEventDetail = (event: any): EventDetail => {
  const languages = Array.from(
    new Set((event.show_dates || []).map((s: any) => s.show_language).filter(Boolean))
  ) as string[];

  const earliestShow = (event.show_dates || [])
    .slice()
    .sort((a: any, b: any) => new Date(a.show_date).getTime() - new Date(b.show_date).getTime())[0];

  return {
    event_id:          event.event_id,
    event_name:        event.event_name,               // 👈 used in card
    event_description: event.event_description,        // 👈 used in About section
    event_city:        event.event_city || event.event_location || 'N/A',
    image_url:         event.image_url || undefined,   // 👈 used in card + background
    release_date:      earliestShow
                          ? new Date(earliestShow.show_date).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : undefined,
    genres:            event.event_gener
                          ? [event.event_gener]
                          : (event.event_genre ? [event.event_genre] : undefined),
    languages:         languages.length ? languages : undefined,
  };
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Event_Detail_Page() {
  const { eventId } = useParams<{ eventId: string }>(); // 👈 reads :eventId from URL

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: 'light' } }),
    []
  );

  const { data: event, isLoading, isError } = useFetchEventByIdQuery(eventId!, {
    skip: !eventId,
  });

  // ── Loading State ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // ── Error / Not Found State ───────────────────────────────────────────
  if (isError || !event) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography color="error">Event not found.</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  const eventDetail = mapApiEventToEventDetail(event); // 👈 real event data

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>

        {/* ── Hero wraps the Card — poster shows in BOTH background & card ── */}
        <EventDetailHero event={eventDetail}>
          <EventDetailCard
            event={eventDetail}
            darkMode={true}
            onBookTickets={() => console.log('Book tickets')}
            onInterested={() => console.log('Interested')}
          />
        </EventDetailHero>

        {/* ── About Section below — shows real event_description ──────────── */}
        <Box sx={{ p: { xs: 3, md: 5 }, color: '#000' }}>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', mb: 1 }}>
            About
          </Box>
          <Box sx={{ color: 'rgba(0,0,0,0.7)', maxWidth: 800 }}>
            {eventDetail.event_description || 'No description available.'}
          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  );
}