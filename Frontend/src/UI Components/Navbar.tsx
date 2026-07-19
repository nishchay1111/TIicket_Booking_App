import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications'; // 👈 added
import Badge from '@mui/material/Badge';                            // 👈 added
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import { useGetUserQuery } from '../redux/slice/usersOperations';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
    minWidth: '450px',
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
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export default function SearchAppBar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');

  const { data: userData } = useGetUserQuery(undefined, {
    skip: !isLoggedIn,
  });

  const firstLetter = userData?.user?.user_name?.charAt(0)?.toUpperCase() || null;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    handleClose();
    navigate('/user_login');
  };

  const handleLogin = () => {
    handleClose();
    navigate('/user_login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>

          {/* ── Left — Logo ──────────────────────────────────────── */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            MUI
          </Typography>

          {/* ── Center — Search Bar ──────────────────────────────── */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Box>

          {/* ── Right — Notification Bell + User Icon ────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            {/* 👈 Notification Bell */}
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
            >
              <Badge badgeContent={0} color="error" invisible={true}>
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* 👈 User Icon */}
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
                    bgcolor: 'rgba(255,255,255,0.3)',
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
              <MenuItem
                onClick={handleClose}
                disabled={!isLoggedIn}
                sx={{ opacity: isLoggedIn ? 1 : 0.4 }}
              >
                My Tickets
              </MenuItem>

              {isLoggedIn ? (
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              ) : (
                <MenuItem onClick={handleLogin}>
                  Login
                </MenuItem>
              )}
            </Menu>
          </Box>

        </Toolbar>
      </AppBar>
    </Box>
  );
}