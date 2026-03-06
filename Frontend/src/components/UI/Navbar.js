import * as React from 'react';
import { useState } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import {
  AppBar, Box, Toolbar, IconButton, Typography, InputBase,
  Badge, MenuItem, Menu, Button
} from '@mui/material';
import {
  Menu as MenuIcon, Search as SearchIcon, AccountCircle,
  Mail as MailIcon, Notifications as NotificationsIcon, MoreVert as MoreIcon
} from '@mui/icons-material';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import { useDispatch } from 'react-redux';
import { showAlert } from '../../redux/store';

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

const NavBar = () => {
  const location = useLocation();

  // --- 1. State for Menus ---
  const [ucircle, setUcircle] = useState(null);
  const [mobileUcirlce, setmobileUcirlce] = useState(null);

  const isUcircleOpen = Boolean(ucircle);
  const isMobileUcircleOpen = Boolean(mobileUcirlce);

  // --- 2. Menu Handlers ---
  const handleUcircleMenuOpen = (event) => setUcircle(event.currentTarget);
  const handleMobileUcirlceClose = () => setmobileUcirlce(null);
  const handleMenuClose = () => {
    setUcircle(null);
    handleMobileUcirlceClose ();
  };
  const handleMobileMenuOpen = (event) => setmobileUcirlce(event.currentTarget);

  // --- 3. Dynamic Logic Variables ---
  const isOrganizerPage = location.pathname.includes('organizer');
  const isHomePage = location.pathname === '/userHome' || location.pathname === '/organizerHome';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/userHome': return 'User Dashboard';
      case '/organizerHome': return 'Admin Panel';
      case '/userSignup': return 'Create Account';
      case '/userLogin': return 'User Login';
      case '/organizerLogin': return 'Organizer Login';
      default: return 'Ticket App';
    }
  };

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  // --- 4. Sub-Components for Menus ---
  const renderMenu = (
    <Menu
      ucircle={ucircle}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isUcircleOpen}
      onClose={handleMenuClose}>
      <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>Sign In</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      mobileUcirlce={mobileUcirlce}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileUcircleOpen}
      onClose={handleMobileUcirlceClose}
    >
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={4} color="error"><MailIcon /></Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={0} color="error"><NotificationsIcon /></Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleUcircleMenuOpen}>
        <IconButton size="large" color="inherit"><AccountCircle /></IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: isOrganizerPage ? '#37474f' : 'primary.main',
          transition: 'background-color 0.3s ease' 
        }}
      >
        <Toolbar>          
          <Button color="inherit" startIcon={<LocalActivityRoundedIcon />}>
            <Typography variant="h6" noWrap component="div" sx={{ textTransform: 'none' }}>
              Ticket App
            </Typography>
          </Button>

          {isHomePage && (
            <Search>
              <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
              <StyledInputBase placeholder="Search..." />
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

      <Box component="main" sx={{ p: 3 }}>
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default NavBar;