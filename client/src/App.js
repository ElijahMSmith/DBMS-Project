import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';

const pages = [
    { name: 'Events', ref: '/events' },
    { name: 'Manage RSO', ref: '/manage_rso' },
    { name: 'Manage University', ref: '/manage_university' },
    { name: 'Unapproved Events', ref: '/unapproved' },
];

const App = () => {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [user, setUserData] = useState(null);
    const [loginOpen, setLoginOpen] = useState(true);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{
                            mr: 3,
                            ml: 3,
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        Univents
                    </Typography>
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        {pages.map((page) => (
                            <Button
                                component={Link}
                                to={page.ref}
                                key={page}
                                sx={{
                                    my: 2,
                                    color: 'white',
                                    display: 'block',
                                }}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    {user ? (
                        <Box sx={{ flexGrow: 0 }}>
                            <IconButton
                                onClick={(event) =>
                                    setAnchorElUser(event.currentTarget)
                                }
                            >
                                <AccountCircleIcon
                                    fontSize="large"
                                    sx={{ color: '#e3e3e3' }}
                                />
                            </IconButton>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={() => setAnchorElUser(null)}
                            >
                                <MenuItem
                                    key="Profile"
                                    onClick={() => setAnchorElUser(null)}
                                >
                                    <Typography textAlign="center">
                                        Profile
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    key="Logout"
                                    onClick={() => setAnchorElUser(null)}
                                >
                                    <Typography textAlign="center">
                                        Logout
                                    </Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Button
                            key="Log-in"
                            sx={{
                                my: 2,
                                color: 'white',
                                display: 'block',
                            }}
                            onClick={() => setLoginOpen(true)}
                        >
                            Log in
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            {loginOpen ? (
                <LoginModal
                    open={loginOpen}
                    setOpen={setLoginOpen}
                    setUserData={setUserData}
                />
            ) : null}
        </Box>
    );
};
export default App;
