import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EventCarousel, type EventItem } from '../UI Components/HorizontalScrollCarousel';
import { useFetchAllEventsQuery } from '../redux/slice/usersOperations';

const DARK_MODE = false;

const PROMOTED_EVENT_IDS: string[] = [
  'e86e3edc-f6bb-4191-91da-feb97ea7bbb7',
  'd75e1df1-5139-4dc1-b8af-be8b26cfde51',
  '806e89b5-63df-43aa-9f52-4c5d67247b4e',
];

/**
 * Shape definition for promotional hero listings, carrying geometric rendering properties,
 * fallbacks, background parameters, and deep navigation targets.
 */
interface PromotedBanner {
  event_id: string | null;
  title: string;
  subtitle: string;
  cta: string;
  image_url?: string | null;
  gradient: string;
  emoji: string;
}

const FALLBACK_BANNERS: PromotedBanner[] = [
  {
    event_id: null,
    title: 'Flat 5% Cashback',
    subtitle: 'Get extra cashback on your first Ticket App payment',
    cta: 'Apply Now',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0288d1 100%)',
    emoji: '💳',
  },
  {
    event_id: null,
    title: 'Comedy Nights Live',
    subtitle: 'Book now and get 20% off on all comedy shows this weekend',
    cta: 'Book Now',
    gradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #e91e63 100%)',
    emoji: '🎤',
  },
  {
    event_id: null,
    title: 'Music Festival 2026',
    subtitle: 'Experience the biggest music festival of the year',
    cta: 'Explore',
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #f9a825 100%)',
    emoji: '🎶',
  },
];

/**
 * Parses the available event cache using configured promotional keys to construct 
 * structural image metadata banners with textual clamping safety boundaries.
 */
const buildPromotedBanners = (events: any[], promotedIds: string[]): PromotedBanner[] => {
  const banners: PromotedBanner[] = [];

  promotedIds.forEach((id) => {
    const event = events.find((e: any) => e.event_id === id);
    if (!event) return;

    banners.push({
      event_id: event.event_id,
      title: event.event_name,
      subtitle: event.event_description
        ? event.event_description.slice(0, 90) + (event.event_description.length > 90 ? '…' : '')
        : `Book your tickets now for ${event.event_name}`,
      cta: 'Book Now',
      image_url: event.image_url || null,
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      emoji: '🎬',
    });
  });

  return banners;
};

/**
 * HeroBanner presents an endless sliding loop configuration utilizing responsive dimension 
 * calculations, stateful tracking boundaries, index loops, and precise drag delta captures.
 */
function HeroBanner({
  banners,
  onBannerClick,
}: {
  banners: PromotedBanner[];
  onBannerClick?: (eventId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const total = banners.length;

  const firstBanner = banners[0];
  const lastBanner = banners[total - 1];

  const extendedBanners = firstBanner && lastBanner
    ? [lastBanner, ...banners, firstBanner]
    : [];

  const [containerWidth, setContainerWidth] = useState(0);
  const [current, setCurrent] = useState(1);
  const [paused, setPaused] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragMovedRef = useRef(false);

  const GAP = 6;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PEEK = Math.min(Math.max(containerWidth * 0.07, 30), 120);
  const slideWidth = Math.max(containerWidth - PEEK * 2, 0);

  const next = () => setCurrent((c) => c + 1);
  const prev = () => setCurrent((c) => c - 1);

  useEffect(() => {
    if (paused || isDragging || total === 0) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, isDragging, total]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'transform') return;

    if (current === extendedBanners.length - 1) {
      setTransitionEnabled(false);
      setCurrent(1);
    } else if (current === 0) {
      setTransitionEnabled(false);
      setCurrent(total);
    }
  };

  useEffect(() => {
    if (!transitionEnabled) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }
  }, [transitionEnabled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragMovedRef.current = false;
    dragStartX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStartX.current;
    if (Math.abs(offset) > 6) dragMovedRef.current = true;
    setDragOffset(offset);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    const threshold = slideWidth * 0.18;

    if (dragOffset > threshold) {
      prev();
    } else if (dragOffset < -threshold) {
      next();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleSlideClick = (eventId: string | null) => {
    if (dragMovedRef.current) return;
    if (eventId && onBannerClick) {
      onBannerClick(eventId);
    }
  };

  const handleDotClick = (i: number) => setCurrent(i + 1);

  const activeDot =
    current === 0 ? total - 1
    : current === extendedBanners.length - 1 ? 0
    : current - 1;

  const baseTranslate = -(current * (slideWidth + GAP)) + PEEK;
  const translateX = baseTranslate + (isDragging ? dragOffset : 0);

  if (extendedBanners.length === 0 || containerWidth === 0) {
    return <Box ref={containerRef} sx={{ width: '100%', height: { xs: 180, sm: 240, md: 300 }, mb: 4 }} />;
  }

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', mb: 4, overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Box
        onTransitionEnd={handleTransitionEnd}
        sx={{
          display: 'flex',
          gap: `${GAP}px`,
          transform: `translateX(${translateX}px)`,
          transition: (isDragging || !transitionEnabled)
            ? 'none'
            : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {extendedBanners.map((banner, i) => {
          const isActive = i === current;
          return (
            <Box
              key={`${banner.event_id || banner.title}-${i}`}
              onClick={() => handleSlideClick(banner.event_id)}
              sx={{
                flex: `0 0 ${slideWidth}px`,
                height: { xs: 180, sm: 240, md: 300 },
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                background: banner.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 3, md: 8 },
                userSelect: 'none',
                cursor: banner.event_id ? 'pointer' : 'grab',
                transform: isActive ? 'scale(1)' : 'scale(0.94)',
                opacity: isActive ? 1 : 0.65,
                transition: 'transform 0.4s ease, opacity 0.4s ease',
              }}
            >
              {banner.image_url && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${banner.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              {banner.image_url && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
                  }}
                />
              )}

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: '#fff', fontSize: { xs: '1.3rem', md: '2.5rem' } }}
                >
                  {banner.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, mb: 2, maxWidth: 400, display: { xs: 'none', sm: 'block' } }}
                >
                  {banner.subtitle}
                </Typography>
                <Box
                  component="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(banner.event_id);
                  }}
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

              {!banner.image_url && (
                <Box sx={{ position: 'relative', zIndex: 1, fontSize: { xs: '48px', md: '100px' } }}>
                  {banner.emoji}
                </Box>
              )}
            </Box>
          );
        })}
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
          zIndex: 2,
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
          zIndex: 2,
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
          zIndex: 2,
        }}
      >
        {banners.map((_, i) => (
          <Box
            key={i}
            onClick={() => handleDotClick(i)}
            sx={{
              width: i === activeDot ? 20 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === activeDot ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

/**
 * Normalizes api show items down to consistent sub-structures used by multi-card carousels.
 */
const mapEventToEventItem = (event: any): EventItem => {
  const firstShow = event.shows?.[0];
  return {
    event_id:     event.event_id,
    event_name:   event.event_name,
    event_city:   firstShow?.venue_address?.city || 'N/A',
    show_date:    firstShow
                    ? new Date(firstShow.show_date).toLocaleDateString('en-IN', {
                        weekday: 'short', day: '2-digit', month: 'short',
                      })
                    : 'TBA',
    show_onwards: (event.shows?.length || 0) > 1,
    image_url:    event.image_url || null,
  };
};

/**
 * Standardizes categorization title names to ensure visual interface uniformity.
 */
const formatLabelTitle = (label: string): string => {
  const normalized = label.trim().toLowerCase();
  const titleCased  = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  if (titleCased === 'Movie')  return 'Movies';
  if (titleCased === 'Sport')  return 'Sports';
  return titleCased;
};

/**
 * Segregates raw lists of unified events into distinct structures categorized by primary string filters.
 */
const groupEventsByCategory = (rawEvents: any[]) => {
  const groups: Record<string, { rawKey: string; events: EventItem[] }> = {};

  rawEvents.forEach((event) => {
    const rawCategory = event.event_category || 'Other';
    const categoryKey = rawCategory.trim().toLowerCase();

    if (!groups[categoryKey]) {
      groups[categoryKey] = { rawKey: categoryKey, events: [] };
    }
    groups[categoryKey].events.push(mapEventToEventItem(event));
  });

  return Object.entries(groups)
    .map(([categoryKey, data]) => ({
      title:   formatLabelTitle(categoryKey),
      rawKey:  data.rawKey,
      events:  data.events,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};

/**
 * Groups events together using specified granular category sub-genre parameters.
 */
const groupEventsByGenre = (rawEvents: any[]) => {
  const groups: Record<string, EventItem[]> = {};

  rawEvents.forEach((event) => {
    const rawGenre = event.event_gener || 'Other';
    const genreKey = rawGenre.trim().toLowerCase();

    if (!groups[genreKey]) {
      groups[genreKey] = [];
    }
    groups[genreKey].push(mapEventToEventItem(event));
  });

  return Object.entries(groups)
    .map(([genreKey, events]) => ({
      title: formatLabelTitle(genreKey),
      events,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};

/**
 * User_Home_Page serves as the root consumer hub viewport, handling live search parameters,
 * query filtering pipelines, fallback states, carousel mapping layers, and deep link navigation.
 */
export default function User_Home_Page() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() || '';
  const categoryFilter = searchParams.get('category')?.trim().toLowerCase() || '';

  const theme = React.useMemo(
    () => createTheme({ palette: { mode: DARK_MODE ? 'dark' : 'light' } }),
    []
  );

  const { data: events, isLoading, isError } = useFetchAllEventsQuery();

  const heroBanners = React.useMemo(() => {
    if (!events) return [];
    const promoted = buildPromotedBanners(events, PROMOTED_EVENT_IDS);
    return promoted.length > 0 ? promoted : FALLBACK_BANNERS;
  }, [events]);

  const handleBannerClick = (eventId: string) => {
    navigate(`/show_details/${eventId}`);
  };

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    if (!searchQuery) return events;
    return events.filter((event: any) =>
      event.event_name?.toLowerCase().includes(searchQuery) ||
      event.event_category?.toLowerCase().includes(searchQuery) ||
      event.event_gener?.toLowerCase().includes(searchQuery)
    );
  }, [events, searchQuery]);

  const categoryFilteredEvents = React.useMemo(() => {
    if (!events || !categoryFilter) return [];
    return events.filter((event: any) =>
      (event.event_category || 'Other').trim().toLowerCase() === categoryFilter
    );
  }, [events, categoryFilter]);

  const categorizedEvents = groupEventsByCategory(filteredEvents);
  const genreGroupedEvents = groupEventsByGenre(categoryFilteredEvents);

  const handleEventClick = (eventId: string) => {
    navigate(`/show_details/${eventId}`);
  };

  const handleSeeAllClick = (rawCategoryKey: string) => {
    navigate(`/user_home?category=${encodeURIComponent(rawCategoryKey)}`);
  };

  const handleBackToAll = () => {
    navigate('/user_home');
  };

  const showCategoryView = !searchQuery && !!categoryFilter;
  const showDefaultView  = !searchQuery && !categoryFilter;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        px: 5,
        py: 4,
        bgcolor: DARK_MODE ? '#121212' : '#ffffff',
      }}>

        {showDefaultView && (
          <HeroBanner banners={heroBanners} onBannerClick={handleBannerClick} />
        )}

        {searchQuery && (
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Showing results for <strong>"{searchParams.get('search')}"</strong>
          </Typography>
        )}

        {showCategoryView && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <IconButton onClick={handleBackToAll} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              {formatLabelTitle(categoryFilter)}
            </Typography>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Typography color="error" textAlign="center" sx={{ mt: 5 }}>
            Failed to load events. Please try again later.
          </Typography>
        )}

        {!isLoading && !isError && !categoryFilter && categorizedEvents.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
            {searchQuery
              ? `No events found matching "${searchParams.get('search')}".`
              : 'No events available right now. Check back soon!'}
          </Typography>
        )}

        {!isLoading && !isError && showCategoryView && genreGroupedEvents.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
            No events found in this category.
          </Typography>
        )}

        {!isLoading && !categoryFilter && categorizedEvents.map((group) => (
          <EventCarousel
            key={group.title}
            title={group.title}
            events={group.events}
            onCardClick={handleEventClick}
            onSeeAllClick={() => handleSeeAllClick(group.rawKey)}
          />
        ))}

        {!isLoading && showCategoryView && genreGroupedEvents.map((group) => (
          <EventCarousel
            key={group.title}
            title={group.title}
            events={group.events}
            onCardClick={handleEventClick}
          />
        ))}

      </Box>
    </ThemeProvider>
  );
}