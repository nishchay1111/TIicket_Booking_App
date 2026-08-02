import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Box,
  Typography,
  Divider,
} from '@mui/material';

const DARK_MODE = false;

/**
 * Slide transition wrapper component driving the entry animations 
 * for the structural details dialog container.
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Shape of historical booking summaries containing structural metadata,
 * geolocation objects, allocation tallies, and fiscal metrics.
 */
interface TicketData {
  ticket_id: string;
  event_id: string;
  event_name: string;
  image_url?: string | null;
  venue_name?: string;
  venue_address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
  show_date: string;
  show_time: string;
  number_of_tickets: number;
  total_price: number;
  date_booked: string;
}

/**
 * Property interface definitions detailing visibility metrics and
 * the foundational receipt payload for ShowDetailsModal.
 */
interface ShowDetailsModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketData | null;
}

/**
 * ShowDetailsModal renders a descriptive breakdown overlay presenting confirmed itinerary options,
 * dynamic schedule timetables, comprehensive address expansions, and transactional audit footprints.
 */
export default function ShowDetailsModal({
  open,
  onClose,
  ticket,
}: ShowDetailsModalProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [ticket?.ticket_id]);

  const colors = {
    bg:       DARK_MODE ? '#1a1a2e'               : '#ffffff',
    text:     DARK_MODE ? '#ffffff'               : '#000000',
    subtext:  DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    border:   DARK_MODE ? 'rgba(255,255,255,0.15)': 'rgba(0,0,0,0.1)',
    cardBg:   DARK_MODE ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.02)',
    accent:   '#e91e63',
    closeBtn: DARK_MODE ? '#ffffff'               : '#000000',
  };

  if (!ticket) return null;

  const fullAddress = ticket.venue_address
    ? [
        ticket.venue_address.street,
        ticket.venue_address.city,
        ticket.venue_address.state,
        ticket.venue_address.zip,
      ].filter(Boolean).join(', ')
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slots={{ transition: Transition }}
      keepMounted
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: colors.bg,
          px: 1,
          pb: 3,
          boxShadow: DARK_MODE
            ? '0 8px 32px rgba(0,0,0,0.8)'
            : '0 8px 32px rgba(0,0,0,0.15)',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, zIndex: 10, color: '#fff' }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>

        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          {ticket.image_url && !imageError ? (
            <Box
              component="img"
              src={ticket.image_url}
              alt={ticket.event_name}
              onError={() => setImageError(true)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '56px',
              }}
            >
              🎬
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              p: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff' }}>
              {ticket.event_name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <EventIcon sx={{ color: colors.accent, fontSize: 22, mt: 0.3 }} />
            <Box>
              <Typography variant="caption" sx={{ color: colors.subtext, display: 'block' }}>
                Show Date
              </Typography>
              <Typography variant="body1" fontWeight="600" sx={{ color: colors.text }}>
                {new Date(ticket.show_date).toLocaleDateString('en-IN', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <AccessTimeIcon sx={{ color: colors.accent, fontSize: 22, mt: 0.3 }} />
            <Box>
              <Typography variant="caption" sx={{ color: colors.subtext, display: 'block' }}>
                Show Time
              </Typography>
              <Typography variant="body1" fontWeight="600" sx={{ color: colors.text }}>
                {ticket.show_time}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
            <LocationOnIcon sx={{ color: colors.accent, fontSize: 22, mt: 0.3 }} />
            <Box>
              <Typography variant="caption" sx={{ color: colors.subtext, display: 'block' }}>
                Venue
              </Typography>
              <Typography variant="body1" fontWeight="600" sx={{ color: colors.text }}>
                {ticket.venue_name || 'Main Venue'}
                {ticket.venue_address?.city ? ` — ${ticket.venue_address.city}` : ''}
              </Typography>
              {fullAddress && (
                <Typography variant="caption" sx={{ color: colors.subtext }}>
                  {fullAddress}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: colors.border, mb: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: colors.subtext }}>
              Number of Tickets
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: colors.text }}>
              {ticket.number_of_tickets}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: colors.subtext }}>
              Total Paid
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: colors.accent }}>
              ₹{ticket.total_price}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: colors.subtext }}>
              Booked On
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              {new Date(ticket.date_booked).toLocaleDateString()}
            </Typography>
          </Box>

        </Box>
      </DialogContent>
    </Dialog>
  );
}