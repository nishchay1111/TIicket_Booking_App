import React, { useEffect, useMemo } from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import MovieIcon from '@mui/icons-material/Movie';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useGetUserQuery, useFetchAllEventsQuery } from '../redux/slice/usersOperations';
import LoginModal from './Modals/LoginModal';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

/**
 * Shape definition for autocompletion suggestions matching events, 
 * architectural categories, or tags grouped during caching workflows.
 */
interface Suggestion {
  type: 'event' | 'category' | 'genre';
  label: string;
  value: string;
  eventId?: string;
  subtitle?: string;
  image_url?: string | null;
}

/**
 * SuggestionRow renders individual search item variations, managing dynamic avatar 
 * image error states and contextually mapped inline iconography.
 */
function SuggestionRow({
  suggestion,
  onSelect,
  getIcon,
}: {
  suggestion: Suggestion;
  onSelect: (s: Suggestion) => void;
  getIcon: (type: Suggestion['type']) => React.ReactNode;
}) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <ListItemButton onClick={() => onSelect(suggestion)}>
      {suggestion.type === 'event' && suggestion.image_url && !imageError ? (
        <ListItemAvatar>
          <Avatar
            variant="rounded"
            src={suggestion.image_url}
            alt={suggestion.label}
            onError={() => setImageError(true)}
            sx={{ width: 40, height: 56, mr: 1 }}
          />
        </ListItemAvatar>
      ) : (
        <ListItemIcon sx={{ minWidth: 32, color: '#e91e63' }}>
          {getIcon(suggestion.type)}
        </ListItemIcon>
      )}
      <ListItemText
        primary={suggestion.label}
        secondary={suggestion.subtitle}
      />
    </ListItemButton>
  );
}

/**
 * SearchAppBar orchestrates structural top navigation capabilities, processing query state updates, 
 * interactive multi-tier dropdown filtering layouts, authentication flows, and unique role routing conditions.
 */
export default function SearchAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isLoggedIn = !!localStorage.getItem('token');

  const { data: userData } = useGetUserQuery(undefined, {
    skip: !isLoggedIn,
  });

  useEffect(() => {
    if (userData) {
      console.log("Full RTK Query Response:", userData);
      console.log("Evaluated Role:", userData?.user?.role);
    }
  }, [userData]);

  const { data: events } = useFetchAllEventsQuery();

  const firstLetter = userData?.user?.user_name?.charAt(0)?.toUpperCase() || null;
  const isOrganizer = userData?.user?.role === 'organizer';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const [searchValue, setSearchValue] = React.useState(
    location.pathname === '/user_home' ? searchParams.get('search') || '' : ''
  );
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);

  React.useEffect(() => {
    if (location.pathname === '/user_home') {
      setSearchValue(searchParams.get('search') || '');
    } else {
      setSearchValue('');
    }
    setSuggestionsOpen(false);
  }, [location.pathname, searchParams]);

  /**
   * Compiles auto-completion parameters against live cached event data, extracting unique matches 
   * up to structural thresholds for names, categories, and tags.
   */
  const suggestions = React.useMemo<Suggestion[]>(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query || !events) return [];

    const eventMatches: Suggestion[] = [];
    const categorySet = new Set<string>();
    const genreSet = new Set<string>();

    events.forEach((event: any) => {
      if (eventMatches.length < 5 && event.event_name?.toLowerCase().includes(query)) {
        eventMatches.push({
          type: 'event',
          label: event.event_name,
          value: event.event_name,
          eventId: event.event_id,
          subtitle: event.event_category,
          image_url: event.image_url || null,
        });
      }
      if (event.event_category?.toLowerCase().includes(query)) {
        categorySet.add(event.event_category);
      }
      if (event.event_gener?.toLowerCase().includes(query)) {
        genreSet.add(event.event_gener);
      }
    });

    const categoryMatches: Suggestion[] = Array.from(categorySet)
      .slice(0, 3)
      .map((c) => ({ type: 'category', label: c, value: c, subtitle: 'Category' } as Suggestion));

    const genreMatches: Suggestion[] = Array.from(genreSet)
      .slice(0, 3)
      .map((g) => ({ type: 'genre', label: g, value: g, subtitle: 'Genre' } as Suggestion));

    return [...eventMatches, ...categoryMatches, ...genreMatches].slice(0, 8);
  }, [searchValue, events]);

  /**
   * Dispatches current search bar values into parameter routes to force dashboard queries.
   */
  const handleSearchSubmit = () => {
    setSuggestionsOpen(false);
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/user_home?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/user_home');
    }
  };

  /**
   * Evaluates layout key signals, steering selection triggers or hiding contextual popovers.
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchSubmit();
    if (e.key === 'Escape') setSuggestionsOpen(false);
  };

  /**
   * Extracts selection variables from rows, determining whether to trigger immediate 
   * route redirection or parameters adjustments.
   */
  const handleSelectSuggestion = (s: Suggestion) => {
    setSuggestionsOpen(false);
    if (s.type === 'event' && s.eventId) {
      setSearchValue('');
      navigate(`/show_details/${s.eventId}`);
    } else {
      setSearchValue(s.value);
      navigate(`/user_home?search=${encodeURIComponent(s.value)}`);
    }
  };

  /**
   * Selects vector icons dynamically mapped to metadata classification types.
   */
  const suggestionIcon = (type: Suggestion['type']) => {
    if (type === 'event') return <MovieIcon fontSize="small" />;
    if (type === 'category') return <CategoryIcon fontSize="small" />;
    return <LocalOfferIcon fontSize="small" />;
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Flushes operational credentials from cache storage layers and forces navigation updates.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    handleClose();
    navigate('/user_home');
  };

  const handleLoginClick = () => {
    handleClose();
    setLoginModalOpen(true);
  };

  const handleMyTicketsClick = () => {
    navigate('/user_tickets');
    handleClose();
  };

  const handleMyEventsClick = () => {
    navigate('/organizer_events');
    handleClose();
  };

  const handleLogoClick = () => {
    navigate('/user_home');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>

          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={handleLogoClick}
            sx={{ mr: 1 }}
          >
            <LocalActivityIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <ClickAwayListener onClickAway={() => setSuggestionsOpen(false)}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: '550px' }}>
                <Search sx={{ width: '100%' }}>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search movies, events…"
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      setSuggestionsOpen(true);
                    }}
                    onFocus={() => {
                      if (searchValue.trim()) setSuggestionsOpen(true);
                    }}
                    onKeyDown={handleSearchKeyDown}
                  />
                </Search>

                {suggestionsOpen && suggestions.length > 0 && (
                  <Paper
                    elevation={6}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 0.5,
                      zIndex: 20,
                      maxHeight: 360,
                      overflowY: 'auto',
                      borderRadius: 2,
                    }}
                  >
                    <List dense disablePadding>
                      {suggestions.map((s, i) => (
                        <SuggestionRow
                          key={`${s.type}-${s.value}-${i}`}
                          suggestion={s}
                          onSelect={handleSelectSuggestion}
                          getIcon={suggestionIcon}
                        />
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            {isLoggedIn && (
              <IconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
              >
                <Badge badgeContent={0} color="error" invisible={true}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {isLoggedIn && firstLetter ? (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    bgcolor: isOrganizer
                      ? 'rgba(233,30,99,0.7)'
                      : 'rgba(255,255,255,0.3)',
                    color: '#fff',
                  }}
                >
                  {firstLetter}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={handleClose}
                disabled={!isLoggedIn}
                sx={{ opacity: isLoggedIn ? 1 : 0.4 }}
              >
                My Profile
              </MenuItem>

              {isLoggedIn && !isOrganizer && (
                <MenuItem onClick={handleMyTicketsClick}>
                  My Tickets
                </MenuItem>
              )}

              {isLoggedIn && isOrganizer && (
                <MenuItem onClick={handleMyEventsClick}>
                  My Events
                </MenuItem>
              )}

              {isLoggedIn ? (
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              ) : (
                <MenuItem onClick={handleLoginClick}>
                  Login
                </MenuItem>
              )}
            </Menu>
          </Box>

        </Toolbar>
      </AppBar>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

    </Box>
  );
}