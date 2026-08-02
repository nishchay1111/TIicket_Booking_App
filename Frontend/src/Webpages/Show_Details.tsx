import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
  CircularProgress,
  Typography,
} from '@mui/material';
import EventDetailHero from '../UI Components/ShowBannerBackground';
import EventDetailCard, { type EventDetail } from '../UI Components/ShowCard';
import BookTicketModal from '../UI Components/Modals/BookTicketModal';
import { useFetchEventByIdQuery } from '../redux/slice/usersOperations';

/**
 * Transforms a raw API event server entity payload into the structured interface contract 
 * expected by the presentation layer layouts, extracting language values and sorting dates.
 */
const mapApiEventToEventDetail = (event: any): EventDetail => {
  const shows = event.shows || [];

  const languages = Array.from(
    new Set(shows.map((s: any) => s.show_language).filter(Boolean))
  ) as string[];

  const earliestShow = shows
    .slice()
    .sort((a: any, b: any) => new Date(a.show_date).getTime() - new Date(b.show_date).getTime())[0];

  return {
    event_id:          event.event_id,
    event_name:        event.event_name,
    event_description: event.event_description,
    event_city:        earliestShow?.venue_address?.city || 'N/A',
    image_url:         event.image_url || undefined,
    release_date:      earliestShow
                          ? new Date(earliestShow.show_date).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : undefined,
    genres:            event.event_gener ? [event.event_gener] : undefined,
    languages:         languages.length ? languages : undefined,
  };
};

/**
 * Event_Detail_Page orchestrates the complete detailed display layout for a specific entity,
 * parsing routing configurations, coordinating fetch state workflows, and driving checkout modal steps.
 */
export default function Event_Detail_Page() {
  const { eventId } = useParams<{ eventId: string }>();

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: 'light' } }),
    []
  );

  const { data: event, isLoading, isError } = useFetchEventByIdQuery(eventId!, {
    skip: !eventId,
  });

  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);

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

  const eventDetail = mapApiEventToEventDetail(event);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>

        <EventDetailHero event={eventDetail}>
          <EventDetailCard
            event={eventDetail}
            darkMode={true}
            onBookTickets={() => setBookingModalOpen(true)}
            onInterested={() => console.log('Interested')}
          />
        </EventDetailHero>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            About
          </Typography>
          <Typography sx={{ color: 'rgba(0,0,0,0.7)', maxWidth: 800 }}>
            {eventDetail.event_description || 'No description available.'}
          </Typography>
        </Box>

        <BookTicketModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          event={{
            event_id:   event.event_id,
            event_name: event.event_name,
            shows:      event.shows,
          }}
        />

      </Box>
    </ThemeProvider>
  );
}