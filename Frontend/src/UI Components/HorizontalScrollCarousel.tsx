import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface EventItem {
  event_id: string;
  event_name: string;
  event_city: string;
  show_date: string;
  show_onwards: boolean;
  emoji?: string;
  image_url?: string | null;
}

// ─── Event Card Component ─────────────────────────────────────────────────────
export function EventCard({
  event,
  onClick,
}: {
  event: EventItem;
  onClick?: (eventId: string) => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      onClick={() => onClick?.(event.event_id)}
      sx={{
        minWidth: 260,
        maxWidth: 260,
        cursor: 'pointer',
        flexShrink: 0,
        '&:hover .card-image': {
          transform: 'scale(1.03)',
        },
      }}
    >
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 1 }}>
        {event.image_url && !imageError ? (
          <Box
            component="img"
            className="card-image"
            src={event.image_url}
            alt={event.event_name}
            onError={() => setImageError(true)}
            sx={{
              height: 380,
              width: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.3s ease',
            }}
          />
        ) : (
          <Box
            className="card-image"
            sx={{
              height: 380,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '90px',
              transition: 'transform 0.3s ease',
            }}
          >
            {event.emoji || '🎬'}
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.65)',
            color: '#fff',
            px: 1.5,
            py: 0.75,
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {event.show_date}{event.show_onwards ? ' onwards' : ''}
        </Box>
      </Box>

      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '15px',
        }}
      >
        {event.event_name}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontSize="14px">
        {event.event_city}
      </Typography>
    </Box>
  );
}

// ─── Carousel Component ───────────────────────────────────────────────────────
export function EventCarousel({
  title,
  events,
  onCardClick,
}: {
  title: string;
  events: EventItem[];
  onCardClick?: (eventId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showLeft, setShowLeft]   = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 0;
    const atEnd   = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setShowLeft(!atStart);
    setShowRight(!atEnd);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    return () => el.removeEventListener('scroll', updateArrows);
  }, [updateArrows]);

  useEffect(() => {
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'right' ? 800 : -800,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ mb: 5 }}>

      {/* ── Section Header ─────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
      }}>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#e91e63', cursor: 'pointer', fontWeight: 500 }}
        >
        </Typography>
      </Box>

      {/* ── Carousel Wrapper ─────────────────────────────────────────────── */}
      <Box sx={{ position: 'relative' }}>

        {showLeft && (
          <IconButton
            onClick={() => scroll('left')}
            sx={{
              position: 'absolute',
              left: -20,
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              '&:hover': { background: 'rgba(0,0,0,0.9)' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            pb: 1,
          }}
        >
          {events.map((event) => (
            <EventCard key={event.event_id} event={event} onClick={onCardClick} />
          ))}
        </Box>

        {showRight && (
          <IconButton
            onClick={() => scroll('right')}
            sx={{
              position: 'absolute',
              right: -20,
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              '&:hover': { background: 'rgba(0,0,0,0.9)' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}

      </Box>
    </Box>
  );
}