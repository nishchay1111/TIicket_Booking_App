import * as React from 'react';
import { useState } from "react";
// 1. Corrected type-only imports for verbatimModuleSyntax
import type { MouseEvent } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import {
  AppBar, Box, Toolbar, IconButton, Typography, InputBase,
  Badge, MenuItem, Menu, Button, Container
} from '@mui/material';
import {
  Search as SearchIcon, AccountCircle,
  Mail as MailIcon, Notifications as NotificationsIcon, MoreVert as MoreIcon
} from '@mui/icons-material';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import { useAppDispatch } from '../../redux/hooks';
import { showAlert } from '../../redux/slice/alert';

// --- Styled Components ---
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const NavBar: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [ucircle, setUcircle] = useState<null | HTMLElement>(null);
  const [mobileUcircle, setMobileUcircle] = useState<null | HTMLElement>(null);

  const isUcircleOpen = Boolean(ucircle);
  const isMobileUcircleOpen = Boolean(mobileUcircle);

  // 2. MouseEvent is now properly typed
  const handleUcircleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setUcircle(event.currentTarget);
  };

  const handleMobileUcircleClose = () => {
    setMobileUcircle(null);
  };

  const handleMenuClose = () => {
    setUcircle(null);
    handleMobileUcircleClose();
  };

  const handleMobileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMobileUcircle(event.currentTarget);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(showAlert({ message: "Logged out successfully", severity: "info" }));
    handleMenuClose();
  };

  const isOrganizerPage = location.pathname.includes('organizer');
  // Check if current page should show search bar
  const isHomePage = location.pathname === '/userhome' || location.pathname === '/organizershome';

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  const renderMenu = (
    <Menu
      anchorEl={ucircle} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isUcircleOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileUcircle} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileUcircleOpen}
      onClose={handleMobileUcircleClose}
    >
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={4} color="error"><MailIcon /></Badge>
        </IconButton>
        <Typography variant="inherit">Messages</Typography>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={0} color="error"><NotificationsIcon /></Badge>
        </IconButton>
        <Typography variant="inherit">Notifications</Typography>
      </MenuItem>
      <MenuItem onClick={handleUcircleMenuOpen}>
        <IconButton size="large" color="inherit"><AccountCircle /></IconButton>
        <Typography variant="inherit">Profile</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: isOrganizerPage ? '#37474f' : '#1976d2',
          transition: 'background-color 0.3s ease' 
        }}
      >
        <Toolbar>          
          <Button color="inherit" startIcon={<LocalActivityRoundedIcon />}>
            <Typography variant="h6" noWrap component="div" sx={{ textTransform: 'none', display: { xs: 'none', sm: 'block' } }}>
              Ticket App
            </Typography>
          </Button>

          {isHomePage && (
            <Search>
              <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
              <StyledInputBase placeholder="Search events..." />
            </Search>
          )}

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {isHomePage && (
              <>
                <IconButton size="large" color="inherit">
                  <Badge badgeContent={4} color="error"><MailIcon /></Badge>
                </IconButton>
                <IconButton size="large" color="inherit">
                  <Badge badgeContent={0} color="error"><NotificationsIcon /></Badge>
                </IconButton>
              </>
            )}
            <IconButton
              size="large"
              edge="end"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleUcircleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderMenu}

      <Container component="main" sx={{ py: 3 }} maxWidth={false}>
        <Outlet /> 
      </Container>
    </Box>
  );
};

export default NavBar;