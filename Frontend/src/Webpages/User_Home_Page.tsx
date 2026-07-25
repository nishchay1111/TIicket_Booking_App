import React, { useState, useEffect } from 'react';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { EventCarousel, type EventItem } from '../UI Components/HorizontalScrollCarousel';
import { useFetchAllEventsQuery } from '../redux/slice/usersOperations';

// ─── 🌙 Toggle Dark Mode Here ────────────────────────────────────────────────
const DARK_MODE = false;

// ─── Sample Hero Banners ──────────────────────────────────────────────────────
const HERO_BANNERS = [
  {
    id: 1,
    title: 'Flat 5% Cashback',
    subtitle: 'Get extra cashback on your first Ticket App payment',
    cta: 'Apply Now',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0288d1 100%)',
    emoji: '💳',
  },
  {
    id: 2,
    title: 'Comedy Nights Live',
    subtitle: 'Book now and get 20% off on all comedy shows this weekend',
    cta: 'Book Now',
    gradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #e91e63 100%)',
    emoji: '🎤',
  },
  {
    id: 3,
    title: 'Music Festival 2026',
    subtitle: 'Experience the biggest music festival of the year',
    cta: 'Explore',
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #f9a825 100%)',
    emoji: '🎶',
  },
];

// ─── Hero Banner Component ────────────────────────────────────────────────────
function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const next = () => {
    setCurrent((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const banner = HERO_BANNERS[current];

  if (!banner) return null;

  return (
    <Box
      sx={{ position: 'relative', width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Box
        key={current}
        sx={{
          height: { xs: 180, sm: 240, md: 300 },
          background: banner.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 8 },
          animation: 'slideIn 0.5s ease-in-out',
          '@keyframes slideIn': {
            from: { transform: 'translateX(100%)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ color: '#fff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}
          >
            {banner.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, mb: 2, maxWidth: 400 }}
          >
            {banner.subtitle}
          </Typography>
          <Box
            component="button"
            sx={{
              px: 3,
              py: 1,
              bgcolor: '#fff',
              color: '#1a237e',
              border: 'none',
              borderRadius: 1,
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
            }}
          >
            {banner.cta}
          </Box>
        </Box>

        <Box sx={{ fontSize: { xs: '60px', md: '100px' }, userSelect: 'none' }}>
          {banner.emoji}
        </Box>
      </Box>

      <IconButton
        onClick={prev}
        sx={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <IconButton
        onClick={next}
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {HERO_BANNERS.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrent(i)}
            sx={{
              width: i === current ? 20 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// ─── Helper — map API event data to EventItem shape ──────────────────────────
const mapEventToEventItem = (event: any): EventItem => {
  const firstShow = event.show_dates?.[0];
  return {
    event_id:     event.event_id,
    event_name:   event.event_name,
    event_city:   event.event_city || event.event_location || 'N/A',
    show_date:    firstShow
                    ? new Date(firstShow.show_date).toLocaleDateString('en-IN', {
                        weekday: 'short', day: '2-digit', month: 'short',
                      })
                    : 'TBA',
    show_onwards: (event.show_dates?.length || 0) > 1,
    image_url:    event.image_url || null,
  };
};

// ─── Helper — normalize category name for display ────────────────────────────
const formatCategoryTitle = (category: string): string => {
  const normalized = category.trim().toLowerCase();
  const titleCased  = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  if (titleCased === 'Movie')  return 'Movies';
  if (titleCased === 'Sport')  return 'Sports';
  return titleCased;
};

// ─── Helper — group raw events by category ───────────────────────────────────
const groupEventsByCategory = (rawEvents: any[]) => {
  const groups: Record<string, EventItem[]> = {};

  rawEvents.forEach((event) => {
    const rawCategory = event.event_category || 'Other';
    const categoryKey = rawCategory.trim().toLowerCase();

    if (!groups[categoryKey]) {
      groups[categoryKey] = [];
    }
    groups[categoryKey].push(mapEventToEventItem(event));
  });

  return Object.entries(groups)
    .map(([categoryKey, events]) => ({
      title:  formatCategoryTitle(categoryKey),
      events,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function User_Home_Page() {
  const navigate = useNavigate(); // 👈 added

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  const { data: events, isLoading, isError } = useFetchAllEventsQuery();

  const categorizedEvents = groupEventsByCategory(events || []);

  const handleEventClick = (eventId: string) => { // 👈 added
    navigate(`/show_details/${eventId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        px: 5,
        py: 4,
        bgcolor: DARK_MODE ? '#121212' : '#ffffff',
      }}>

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <HeroBanner />

        {/* ── Loading State ────────────────────────────────────────── */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {/* ── Error State ──────────────────────────────────────────── */}
        {isError && (
          <Typography color="error" textAlign="center" sx={{ mt: 5 }}>
            Failed to load events. Please try again later.
          </Typography>
        )}

        {/* ── Empty State ──────────────────────────────────────────── */}
        {!isLoading && !isError && categorizedEvents.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
            No events available right now. Check back soon!
          </Typography>
        )}

        {/* ── One Carousel per Category ────────────────────────────── */}
        {!isLoading && categorizedEvents.map((group) => (
          <EventCarousel
            key={group.title}
            title={group.title}
            events={group.events}
            onCardClick={handleEventClick} // 👈 added
          />
        ))}

      </Box>
    </ThemeProvider>
  );
}