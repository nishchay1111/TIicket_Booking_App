import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';

/**
 * Shape definition for detailed event item metadata, including scheduling parameters,
 * localized tracking metrics, classification formats, and individual booking arrays.
 */
export interface EventDetail {
  event_id: string;
  event_name: string;
  event_description?: string;
  event_city: string;
  image_url?: string;
  release_date?: string;
  duration?: string;
  genres?: string[];
  formats?: string[];
  languages?: string[];
  interested_count?: number;
  show_dates?: {
    show_id: string;
    show_date: string;
    show_time: string;
    ticket_price: number;
    available_tickets: number;
  }[];
}

/**
 * Property interface definitions detailing interaction callbacks, layout mode 
 * configurations, and conditional component slot overrides.
 */
interface EventDetailCardProps {
  event: EventDetail;
  onBookTickets?: () => void;
  onInterested?: () => void;
  darkMode?: boolean;
  actions?: React.ReactNode;
}

/**
 * EventDetailCard presents a responsive hero layout displaying specific item posters,
 * timeline metadata, interactive interest counters, and contextually injected control blocks.
 */
export default function EventDetailCard({
  event,
  onBookTickets,
  onInterested,
  darkMode = true,
  actions,
}: EventDetailCardProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        alignItems: { xs: 'center', md: 'flex-start' },
        p: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            width: { xs: 200, md: 240 },
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
        >
          {event.image_url && !imageError ? (
            <Box
              component="img"
              src={event.image_url}
              alt={event.event_name}
              onError={() => setImageError(true)}
              sx={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box
              sx={{
                height: 320,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
              }}
            >
              🎬
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              bgcolor: 'rgba(0,0,0,0.75)',
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
            }}
          >
            <PlayCircleOutlineIcon sx={{ color: '#fff', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
              Trailers
            </Typography>
          </Box>
        </Box>

        {event.release_date && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 1,
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary',
            }}
          >
            Releasing on {event.release_date}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: darkMode ? '#fff' : '#000', mb: 2 }}
        >
          {event.event_name}
        </Typography>

        {event.interested_count !== undefined && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              px: 2,
              py: 1.5,
              mb: 2,
              width: '100%',
              maxWidth: 400,
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThumbUpAltOutlinedIcon sx={{ color: '#4caf50', fontSize: 20 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ color: darkMode ? '#fff' : '#000' }}>
                  {event.interested_count.toLocaleString()}+ are interested
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                  Mark interested to add it to your Wishlist
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onInterested}
              sx={{
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? '#fff' : '#000',
                flexShrink: 0,
                '&:hover': { borderColor: '#1976d2', color: '#1976d2' },
              }}
            >
              I'm Interested
            </Button>
          </Box>
        )}

        {(event.duration || event.genres?.length) && (
          <Typography
            variant="body2"
            sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', mb: 2 }}
          >
            {[event.duration, event.genres?.join(', ')].filter(Boolean).join(' • ')}
          </Typography>
        )}

        {event.formats && event.formats.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
            {event.formats.map((format) => (
              <Chip
                key={format}
                label={format}
                size="small"
                variant="outlined"
                sx={{
                  color: darkMode ? '#fff' : '#000',
                  borderColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                  mb: 0.5,
                }}
              />
            ))}
          </Stack>
        )}

        {event.languages && event.languages.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
            {event.languages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                size="small"
                variant="outlined"
                sx={{
                  color: darkMode ? '#fff' : '#000',
                  borderColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                  mb: 0.5,
                }}
              />
            ))}
          </Stack>
        )}

        {actions ? (
          actions
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={onBookTickets}
            sx={{
              bgcolor: '#e91e63',
              color: '#fff',
              px: 5,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '16px',
              borderRadius: 1,
              '&:hover': { bgcolor: '#c2185b' },
            }}
          >
            Book Tickets
          </Button>
        )}
      </Box>
    </Box>
  );
}