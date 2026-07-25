import React from 'react';
import { Box } from '@mui/material';
import type { EventDetail } from './ShowCard';

// ─── Props ────────────────────────────────────────────────────────────────────
interface EventDetailHeroProps {
  event: EventDetail;
  children?: React.ReactNode; // 👈 renders EventDetailCard inside
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EventDetailHero({
  event,
  children,
}: EventDetailHeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 'auto', md: '480px' },
        overflow: 'hidden',
      }}
    >
      {/* ── Background Image Layer ───────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: event.image_url
            ? `url(${event.image_url})`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'blur(20px) brightness(0.4)', // 👈 blurred dark background
          transform: 'scale(1.1)',               // 👈 prevents blur edges showing
        }}
      />

      {/* ── Dark Overlay ─────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* ── Content — EventDetailCard renders here ───────────────── */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}