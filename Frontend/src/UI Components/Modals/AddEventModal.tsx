import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';

const DARK_MODE = false;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ShowFormRow {
  key: string;
  venue_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  show_date: string;
  show_time: string;
  screen: string;
  show_language: string;
  total_tickets: string;
  ticket_price: string;
  active: boolean;
}

const emptyShow = (): ShowFormRow => ({
  key:           Math.random().toString(36).slice(2),
  venue_name:    '',
  street:        '',
  city:          '',
  state:         '',
  zip:           '',
  show_date:     '',
  show_time:     '',
  screen:        '',
  show_language: '',
  total_tickets: '',
  ticket_price:  '',
  active:        true,
});

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onUploadPoster: (file: File) => Promise<{ image_url: string }>;
  onCreateEvent: (payload: any) => Promise<void>;
  isUploading?: boolean;
  isCreating?: boolean;
}

export default function AddEventModal({
  open,
  onClose,
  onUploadPoster,
  onCreateEvent,
  isUploading = false,
  isCreating  = false,
}: AddEventModalProps) {
  const colors = {
    bg:      DARK_MODE ? '#1a1a2e'               : '#ffffff',
    text:    DARK_MODE ? '#ffffff'               : '#000000',
    subtext: DARK_MODE ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    border:  DARK_MODE ? 'rgba(255,255,255,0.15)': 'rgba(0,0,0,0.1)',
    cardBg:  DARK_MODE ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.02)',
    accent:  '#e91e63',
  };

  
  const [eventName,        setEventName]        = React.useState('');
  const [eventDescription, setEventDescription] = React.useState('');
  const [eventCategory,    setEventCategory]    = React.useState('');
  const [eventGener,       setEventGener]       = React.useState('');

  
  const [posterFile,    setPosterFile]    = React.useState<File | null>(null);
  const [posterPreview, setPosterPreview] = React.useState<string | null>(null);

  
  const [shows, setShows] = React.useState<ShowFormRow[]>([emptyShow()]);

  
  const [formError, setFormError] = React.useState('');

  
  React.useEffect(() => {
    if (!open) return;
    setEventName('');
    setEventDescription('');
    setEventCategory('');
    setEventGener('');
    setPosterFile(null);
    setPosterPreview(null);
    setShows([emptyShow()]);
    setFormError('');
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const updateShow = (key: string, field: keyof ShowFormRow, value: any) => {
    setShows((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  const addShowRow    = () => setShows((prev) => [...prev, emptyShow()]);
  const removeShowRow = (key: string) =>
    setShows((prev) => (prev.length > 1 ? prev.filter((s) => s.key !== key) : prev));

  
  const handleSubmit = async () => {
    setFormError('');

    
    if (!eventName.trim()) {
      setFormError('Event name is required.');
      return;
    }

    
    for (const show of shows) {
      if (
        !show.venue_name   ||
        !show.show_date    ||
        !show.show_time    ||
        !show.total_tickets||
        !show.ticket_price
      ) {
        setFormError('Every show needs a venue, date, time, total tickets, and price.');
        return;
      }
    }

    try {
      let imageUrl: string | null = null;

      
      if (posterFile) {
        const uploadResult = await onUploadPoster(posterFile);
        imageUrl = uploadResult.image_url;
      }

      
      const payload = {
        event_name:        eventName.trim(),
        event_description: eventDescription.trim() || undefined,
        event_category:    eventCategory.trim()    || undefined,
        event_gener:       eventGener.trim()        || undefined,
        image_url:         imageUrl                 || undefined,
        shows: shows.map((s) => ({
          venue_name:    s.venue_name,
          venue_address: {
            street: s.street  || undefined,
            city:   s.city    || undefined,
            state:  s.state   || undefined,
            zip:    s.zip     || undefined,
          },
          show_date:         s.show_date,
          show_time:         s.show_time,
          screen:            s.screen || undefined,
          show_language:     s.show_language || 'English',
          total_tickets:     Number(s.total_tickets),
          available_tickets: Number(s.total_tickets), 
          ticket_price:      Number(s.ticket_price),
          active:            s.active,
        })),
      };

      await onCreateEvent(payload);
      onClose();

    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.data?.error   ||
        (Array.isArray(err?.data) ? err.data.map((e: any) => e.constraints ? Object.values(e.constraints).join(', ') : '').join(' | ') : null) ||
        'Failed to create event.';
      setFormError(message);
    }
  };

  const isSubmitting = isUploading || isCreating;

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
          maxHeight: '90vh', 
        },
      }}
    >
      
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: colors.text, zIndex: 10 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          pt: 4,
          overflowY: 'auto', 
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.text, mb: 3 }}>
          Add New Event
        </Typography>

        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ color: colors.text, mb: 1 }}>
            Event Poster
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              border: `1px dashed ${colors.border}`,
              bgcolor: colors.cardBg,
            }}
          >
            {posterPreview ? (
              <Box
                component="img"
                src={posterPreview}
                alt="Poster preview"
                sx={{ width: 60, height: 84, objectFit: 'cover', borderRadius: 1 }}
              />
            ) : (
              <Box
                sx={{
                  width: 60, height: 84, borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                🎬
              </Box>
            )}
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              size="small"
              sx={{ borderColor: colors.border, color: colors.text }}
            >
              {posterFile ? 'Change Image' : 'Upload Image'}
              <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
            </Button>
            {posterFile && (
              <Typography variant="caption" sx={{ color: colors.subtext }}>
                {posterFile.name}
              </Typography>
            )}
          </Box>
        </Box>

        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField
            label="Event Name"
            size="small"
            fullWidth
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            error={!eventName.trim() && !!formError}
          />
          <TextField
            label="Event Description"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Category"
              size="small"
              fullWidth
              placeholder="movie, sports, concert..."
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
            />
            <TextField
              label="Genre"
              size="small"
              fullWidth
              placeholder="Thriller, Rock..."
              value={eventGener}
              onChange={(e) => setEventGener(e.target.value)}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: colors.border, mb: 2 }} />

        
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.text, mb: 2 }}>
          Shows
        </Typography>

        {shows.map((show, index) => (
          <Box
            key={show.key}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" fontWeight="600" sx={{ color: colors.subtext }}>
                Show {index + 1}
              </Typography>
              {shows.length > 1 && (
                <IconButton size="small" onClick={() => removeShowRow(show.key)}>
                  <DeleteIcon fontSize="small" sx={{ color: '#c62828' }} />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              
              <TextField
                label="Venue Name"
                size="small"
                fullWidth
                required
                value={show.venue_name}
                onChange={(e) => updateShow(show.key, 'venue_name', e.target.value)}
              />

              
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="Street"
                  size="small"
                  fullWidth
                  value={show.street}
                  onChange={(e) => updateShow(show.key, 'street', e.target.value)}
                />
                <TextField
                  label="City"
                  size="small"
                  fullWidth
                  value={show.city}
                  onChange={(e) => updateShow(show.key, 'city', e.target.value)}
                />
              </Box>

              
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="State"
                  size="small"
                  fullWidth
                  value={show.state}
                  onChange={(e) => updateShow(show.key, 'state', e.target.value)}
                />
                <TextField
                  label="Zip"
                  size="small"
                  fullWidth
                  value={show.zip}
                  onChange={(e) => updateShow(show.key, 'zip', e.target.value)}
                />
              </Box>

              
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="Show Date"
                  type="date"
                  size="small"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={show.show_date}
                  onChange={(e) => updateShow(show.key, 'show_date', e.target.value)}
                />
                <TextField
                  label="Show Time"
                  type="time"
                  size="small"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={show.show_time}
                  onChange={(e) => updateShow(show.key, 'show_time', e.target.value)}
                />
              </Box>

              
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="Screen"
                  size="small"
                  fullWidth
                  value={show.screen}
                  onChange={(e) => updateShow(show.key, 'screen', e.target.value)}
                />
                <TextField
                  label="Language"
                  size="small"
                  fullWidth
                  placeholder="English"
                  value={show.show_language}
                  onChange={(e) => updateShow(show.key, 'show_language', e.target.value)}
                />
              </Box>

              
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="Total Tickets"
                  type="number"
                  size="small"
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  value={show.total_tickets}
                  onChange={(e) => updateShow(show.key, 'total_tickets', e.target.value)}
                />
                <TextField
                  label="Ticket Price (₹)"
                  type="number"
                  size="small"
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                  value={show.ticket_price}
                  onChange={(e) => updateShow(show.key, 'ticket_price', e.target.value)}
                />
              </Box>

              
              <FormControlLabel
                control={
                  <Switch
                    checked={show.active}
                    onChange={(e) => updateShow(show.key, 'active', e.target.checked)}
                    size="small"
                    sx={{ '& .MuiSwitch-thumb': { bgcolor: show.active ? colors.accent : undefined } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    Active
                  </Typography>
                }
              />
            </Box>
          </Box>
        ))}

        
        <Button
          onClick={addShowRow}
          startIcon={<AddCircleIcon />}
          sx={{
            mb: 3,
            color: colors.accent,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add Another Show
        </Button>

        {/* ── Error ─────────────────────────────────────────────────── */}
        {formError && (
          <Typography variant="body2" color="error" textAlign="center" sx={{ mb: 2 }}>
            {formError}
          </Typography>
        )}

        {/* ── Submit ────────────────────────────────────────────────── */}
        <Button
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit}
          sx={{
            py: 1.3,
            fontWeight: 'bold',
            bgcolor: colors.accent,
            '&:hover': { bgcolor: '#c2185b' },
          }}
        >
          {isSubmitting
            ? isUploading ? 'Uploading Poster...' : 'Creating Event...'
            : 'Create Event'}
        </Button>

      </DialogContent>
    </Dialog>
  );
}