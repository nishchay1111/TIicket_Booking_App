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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventDetailCard, { type EventDetail } from '../UI Components/ShowCard';
import AboutEventModal from '../UI Components/Modals/AboutEventModal';
import ModifyEventModal from '../UI Components/Modals/ModifyEventModal';
import AddEventModal from '../UI Components/Modals/AddEventModal';
import { useFetchAllEventsQuery } from '../redux/slice/usersOperations';
import {
  useDeleteEventMutation,
  useCancelShowMutation,
  useAddShowMutation,
  useCreateEventMutation,
} from '../redux/slice/organizerOperations';
import { useAppDispatch } from '../redux/hooks';
import { showAlert } from '../redux/slice/alert';

const DARK_MODE = false;

/**
 * Checks whether a single show schedule falls within a current or future window 
 * by evaluating the parsed ISO timestamp boundaries.
 */
const isShowUpcoming = (show: any): boolean => {
  if (!show?.show_date) return false;
  const showDateTime = show.show_time
    ? new Date(`${show.show_date}T${show.show_time}:00`)
    : new Date(`${show.show_date}T23:59:59`);
  return showDateTime >= new Date();
};


/**
 * Evaluates whether an entire event context contains no valid future show slots.
 */
const isEventInactive = (event: any): boolean => {
  const shows = event.shows || [];
  if (shows.length === 0) return true;
  return !shows.some((show: any) => isShowUpcoming(show));
};

/**
 * Resolves the primary schedule point for an event by either returning the chronologically
 * closest upcoming timeline entry or falling back to the most recent historical record.
 */
const getDisplayShow = (event: any): any | null => {
  const shows = event.shows || [];
  if (shows.length === 0) return null;

  const upcoming = shows
    .filter((s: any) => isShowUpcoming(s))
    .sort((a: any, b: any) =>
      new Date(`${a.show_date}T${a.show_time || '00:00'}`).getTime() -
      new Date(`${b.show_date}T${b.show_time || '00:00'}`).getTime()
    );

  if (upcoming.length > 0) return upcoming[0];

  const past = shows
    .slice()
    .sort((a: any, b: any) =>
      new Date(`${b.show_date}T${b.show_time || '00:00'}`).getTime() -
      new Date(`${a.show_date}T${a.show_time || '00:00'}`).getTime()
    );
  return past[0] || null;
};

/**
 * Adapts raw data models fetched from backend services into standard layout contracts
 * matching the public interface boundaries expected by display card presentations.
 */
const mapEventToDetail = (event: any): EventDetail => {
  const displayShow = getDisplayShow(event);

  return {
    event_id: event.event_id,
    event_name: event.event_name,
    event_city: displayShow?.venue_address?.city || 'N/A',
    event_description: event.event_description || 'No description provided.',
    release_date: displayShow?.show_date
      ? new Date(displayShow.show_date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
      : 'TBA',
    duration: event.event_gener ? `Genre: ${event.event_gener}` : 'N/A',
    genres: [event.event_category || 'General'],
    formats: displayShow?.show_date
      ? [
        `Show Time: ${new Date(displayShow.show_date).toLocaleDateString('en-IN', {
          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
        })}${displayShow.show_time ? ` • ${displayShow.show_time}` : ''}`,
      ]
      : ['No shows scheduled'],
    image_url: event.image_url || undefined,
    interested_count: undefined,
  };
};

/**
 * Organizer_Events acts as the primary layout view for operational management, handling token-based
 * authentication decryption, active status filtering, operational dispatch flags, and workflow modal states.
 */
export default function Organizer_Events() {
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  const dispatch = useAppDispatch();

  const { data: allEvents, isLoading, isError } = useFetchAllEventsQuery();

  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [cancelShow, { isLoading: isCancelling }] = useCancelShowMutation();
  const [addShow, { isLoading: isAdding }] = useAddShowMutation();
  const [isUploading, setIsUploading] = React.useState(false);
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();

  const [tab, setTab] = React.useState<'active' | 'inactive'>('active');

  const [aboutModalOpen, setAboutModalOpen] = React.useState(false);
  const [modifyModalOpen, setModifyModalOpen] = React.useState(false);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const organizerEvents = React.useMemo(() => {
    if (!allEvents) return [];

    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const parts = token.split('.');
      if (parts.length < 2) return [];

      const base64Url = parts[1];
      const base64 = base64Url!.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const currentOrganizerId = payload?.user?.id;

      return allEvents.filter((event: any) => event.organizer_id === currentOrganizerId);
    } catch (e) {
      console.error("Failed to decode token context", e);
      return [];
    }
  }, [allEvents]);

  const activeEvents = organizerEvents.filter((e: any) => !isEventInactive(e));
  const inactiveEvents = organizerEvents.filter((e: any) => isEventInactive(e));
  const displayedEvents = tab === 'active' ? activeEvents : inactiveEvents;

  const handleOpenAbout = (event: any) => {
    setSelectedEvent(event);
    setAboutModalOpen(true);
  };

  const handleOpenModify = (event: any) => {
    setSelectedEvent(event);
    setModifyModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId).unwrap();
    dispatch(showAlert({ message: 'Event deleted successfully.', severity: 'success' }));
  };

  const handleCancelShow = async (eventId: string, showId: string) => {
    await cancelShow({ eventId, showId }).unwrap();
    dispatch(showAlert({ message: 'Show cancelled successfully.', severity: 'success' }));
  };

  const handleAddShow = async (eventId: string, showData: any) => {
    await addShow({ event_id: eventId, ...showData }).unwrap();
    dispatch(showAlert({ message: 'Show added successfully.', severity: 'success' }));
  };

  // Organizer_Events.tsx — replace handleUploadPoster with this
  const handleUploadPoster = async (file: File): Promise<{ image_url: string }> => {
    const token = localStorage.getItem('token');

    if (!token) throw { data: { message: 'Not logged in' } };

    setIsUploading(true); // 👈 manually set loading state

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/organizers/uploadposter', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'auth-token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw { data: err };
      }

      return response.json();
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateEvent = async (payload: any) => {
    await createEvent(payload).unwrap();
    dispatch(showAlert({ message: 'Event created successfully.', severity: 'success' }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: DARK_MODE ? '#121212' : '#f5f5f5' }}>

        <Box sx={{ px: { xs: 3, md: 5 }, py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                My Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your created listings and show schedules
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                bgcolor: '#e91e63',
                color: '#fff',
                px: 3,
                py: 1,
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { bgcolor: '#c2185b' },
              }}
            >
              Add Event
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={(_, val) => { if (val) setTab(val as 'active' | 'inactive'); }}
              size="small"
              sx={{
                bgcolor: DARK_MODE ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderRadius: 2,
                p: 0.5,
                gap: 0.5,
              }}
            >
              <ToggleButton
                value="active"
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
                Active
                {activeEvents.length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1, px: 0.8, py: 0.1,
                      bgcolor: tab === 'active' ? 'rgba(255,255,255,0.3)' : '#e91e63',
                      color: '#fff', borderRadius: 10, fontSize: '11px', fontWeight: 700,
                      lineHeight: '18px', minWidth: 18, display: 'inline-block', textAlign: 'center',
                    }}
                  >
                    {activeEvents.length}
                  </Box>
                )}
              </ToggleButton>

              <ToggleButton
                value="inactive"
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
                Inactive
                {inactiveEvents.length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1, px: 0.8, py: 0.1,
                      bgcolor: tab === 'inactive' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                      color: tab === 'inactive' ? '#fff' : 'rgba(0,0,0,0.5)',
                      borderRadius: 10, fontSize: '11px', fontWeight: 700,
                      lineHeight: '18px', minWidth: 18, display: 'inline-block', textAlign: 'center',
                    }}
                  >
                    {inactiveEvents.length}
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
            <Typography color="error">Failed to load organizer events.</Typography>
          </Box>
        )}

        {!isLoading && !isError && displayedEvents.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
            {tab === 'active' ? (
              <>
                <Typography variant="h6">No active scheduled events</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Create an event to open up reservation listings.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6">No inactive events found</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Completed show production metrics appear here.
                </Typography>
              </>
            )}
          </Box>
        )}

        {!isLoading && displayedEvents.map((event: any) => (
          <Box
            key={event.event_id}
            sx={{
              mx: { xs: 2, md: 5 },
              mb: 3,
              bgcolor: DARK_MODE ? '#1e1e1e' : '#fff',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: DARK_MODE ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              opacity: tab === 'inactive' ? 0.75 : 1,
            }}
          >
            <EventDetailCard
              event={mapEventToDetail(event)}
              darkMode={DARK_MODE}
              actions={
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenModify(event)}
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
                    Modify Event
                  </Button>
                  {tab === 'active' && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenAbout(event)}
                      sx={{ px: 4, py: 1.2, fontWeight: 'bold', borderRadius: 1 }}
                    >
                      About Event
                    </Button>
                  )}
                </Stack>
              }
            />
          </Box>
        ))}

        <AboutEventModal
          open={aboutModalOpen}
          onClose={() => setAboutModalOpen(false)}
          event={selectedEvent}
        />

        <ModifyEventModal
          open={modifyModalOpen}
          onClose={() => setModifyModalOpen(false)}
          event={selectedEvent}
          onDeleteEvent={handleDeleteEvent}
          onCancelShow={handleCancelShow}
          onAddShow={handleAddShow}
          isDeleting={isDeleting}
          isCancelling={isCancelling}
          isAdding={isAdding}
        />

        <AddEventModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onUploadPoster={handleUploadPoster}
          onCreateEvent={handleCreateEvent}
          isUploading={isUploading}
          isCreating={isCreating}
        />

      </Box>
    </ThemeProvider>
  );
}