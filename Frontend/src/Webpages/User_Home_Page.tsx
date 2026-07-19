import React, { useState, useEffect } from 'react';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Typography,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { EventCarousel, type EventItem } from '../UI Components/HorizontalScrollCarousel';

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

  // ── Auto-rotate ───────────────────────────────────────────────────────
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
      {/* ── Banner Content ──────────────────────────────────────────── */}
      <Box
        key={current}  // 👈 forces re-render on every slide change
        sx={{
          height: { xs: 180, sm: 240, md: 300 },
          background: banner.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 8 },

          // 👈 Slide in from right transition
          animation: 'slideIn 0.5s ease-in-out',
          '@keyframes slideIn': {
            from: { transform: 'translateX(100%)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
        }}
      >
        {/* ── Text ──────────────────────────────────────────────────── */}
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

        {/* ── Emoji ─────────────────────────────────────────────────── */}
        <Box sx={{ fontSize: { xs: '60px', md: '100px' }, userSelect: 'none' }}>
          {banner.emoji}
        </Box>
      </Box>

      {/* ── Left Arrow ──────────────────────────────────────────────── */}
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

      {/* ── Right Arrow ─────────────────────────────────────────────── */}
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

      {/* ── Dot Indicators ──────────────────────────────────────────── */}
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

// ─── Sample Events Data ───────────────────────────────────────────────────────
const SAMPLE_EVENTS: EventItem[] = [
  { event_id: '1', event_name: 'Stand-Up Comedy Night',  event_city: 'Hyderabad', show_date: 'Sun, 12 Jul', show_onwards: false, emoji: '🎤' },
  { event_id: '2', event_name: 'Bhajan Jamming 4.0',     event_city: 'Hyderabad', show_date: 'Sun, 12 Jul', show_onwards: true,  emoji: '🎵' },
  { event_id: '3', event_name: 'The Jam Room Special',   event_city: 'Hyderabad', show_date: 'Sun, 12 Jul', show_onwards: false, emoji: '🎸' },
  { event_id: '4', event_name: 'Comedy Standup Nights',  event_city: 'Hyderabad', show_date: 'Sun, 12 Jul', show_onwards: true,  emoji: '😂' },
  { event_id: '5', event_name: 'Live Music Festival',    event_city: 'Hyderabad', show_date: 'Mon, 13 Jul', show_onwards: true,  emoji: '🎶' },
  { event_id: '6', event_name: 'Gautham Govindan Live',  event_city: 'Hyderabad', show_date: 'Sat, 1 Aug',  show_onwards: false, emoji: '🎙️' },
  { event_id: '7', event_name: 'Masoom Vichar',          event_city: 'Hyderabad', show_date: 'Sun, 12 Jul', show_onwards: true,  emoji: '🃏' },
  { event_id: '8', event_name: 'Aakash Mehta Live',      event_city: 'Hyderabad', show_date: 'Fri, 18 Jul', show_onwards: false, emoji: '🌟' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function User_Home_Page() {
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', px: 5, py: 4 }}>

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <HeroBanner />

        {/* ── Event Carousel ──────────────────────────────────────── */}
        <EventCarousel title="Popular Events" events={SAMPLE_EVENTS} />

      </Box>
    </ThemeProvider>
  );
}