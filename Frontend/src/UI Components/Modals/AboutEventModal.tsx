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
  Chip,
  Divider,
} from '@mui/material';

const DARK_MODE = false;

/**
 * Slide transition wrapper component driving the entry animations 
 * for the structural dialog modal.
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Property interface definitions mapping parameters for the AboutEventModal component.
 */
interface AboutEventModalProps {
  open: boolean;
  onClose: () => void;
  event: any | null;
}

/**
 * Utility helper that categorizes raw show entries by venue identity and 
 * chronologically sorts the grouped sets by date and time parameters.
 * 
 * @param shows - Unsorted collection of show entries belonging to an event.
 * @returns Array of grouped venues containing their respective sorted show items.
 */
const groupShowsByVenue = (shows: any[]) => {
  const groups: Record<string, any[]> = {};
  (shows || []).forEach((show) => {
    const venue = show.venue_name || 'Unspecified Venue';
    if (!groups[venue]) groups[venue] = [];
    groups[venue].push(show);
  });
  return Object.entries(groups).map(([venue, showList]) => ({
    venue,
    shows: showList.sort((a, b) =>
      new Date(`${a.show_date}T${a.show_time || '00:00'}`).getTime() -
      new Date(`${b.show_date}T${b.show_time || '00:00'}`).getTime()
    ),
  }));
};

/**
 * AboutEventModal renders a detailed summary view of an event including descriptions,
 * categorized chips, venue grouping separations, and real-time show status charts.
 */
export default function AboutEventModal({ open, onClose, event }: AboutEventModalProps) {
  const colors = {
    bg:       DARK_MODE ? '#1a1a2e'               : '#ffffff',
    text:     DARK_MODE ? '#ffffff'               : '#000000',
    subtext:  DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    border:   DARK_MODE ? 'rgba(255,255,255,0.15)': 'rgba(0,0,0,0.1)',
    cardBg:   DARK_MODE ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.02)',
    accent:   '#e91e63',
  };

  if (!event) return null;

  const venueGroups = groupShowsByVenue(event.shows || []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slots={{ transition: Transition }}
      keepMounted
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: colors.bg,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: colors.text, zIndex: 10 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 4 }}>

        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.text, mb: 1 }}>
          {event.event_name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {event.event_category && (
            <Chip label={event.event_category} size="small" sx={{ bgcolor: colors.accent, color: '#fff', fontWeight: 600 }} />
          )}
          {event.event_gener && (
            <Chip label={event.event_gener} size="small" variant="outlined" sx={{ borderColor: colors.border, color: colors.text }} />
          )}
        </Box>

        <Divider sx={{ borderColor: colors.border, mb: 2 }} />

        {venueGroups.length === 0 && (
          <Typography sx={{ color: colors.subtext, textAlign: 'center', py: 3 }}>
            No shows have been scheduled for this event yet.
          </Typography>
        )}

        {venueGroups.map((group) => (
          <Box key={group.venue} sx={{ mb: 3 }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocationOnIcon sx={{ color: colors.accent, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text }}>
                {group.venue}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
              {group.shows.map((show: any) => {
                const total     = Number(show.total_tickets) || 0;
                const available = Number(show.available_tickets) || 0;
                const booked    = total - available;

                return (
                  <Box
                    key={show.show_id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <EventIcon sx={{ fontSize: 16, color: colors.subtext }} />
                      <Typography variant="body2" fontWeight="600" sx={{ color: colors.text }}>
                        {new Date(show.show_date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </Typography>
                      <AccessTimeIcon sx={{ fontSize: 16, color: colors.subtext, ml: 1 }} />
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {show.show_time || 'TBA'}
                      </Typography>
                      {show.active === false && (
                        <Chip label="Cancelled" size="small" color="error" sx={{ ml: 1, height: 20 }} />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <ConfirmationNumberIcon sx={{ fontSize: 16, color: colors.subtext }} />
                      <Typography variant="caption" sx={{ color: colors.subtext }}>
                        {booked} booked
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.subtext }}>•</Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: available > 0 ? '#2e7d32' : '#c62828', fontWeight: 600 }}
                      >
                        {available} available
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.subtext }}>
                        / {total} total
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}

      </DialogContent>
    </Dialog>
  );
}