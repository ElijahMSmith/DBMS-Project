import { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Button,
    MenuItem,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { Link, Outlet } from 'react-router-dom';

const pages = [
    { name: 'Home', ref: '/', permLevel: 0 },
    { name: 'RSOs', ref: '/rsos', permLevel: 0 },
    { name: 'Universities', ref: '/universities', permLevel: 0 },
    { name: 'My Events', ref: '/myevents', permLevel: 2 },
];

const App = (props) => {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);

    const { userData, setUserData } = props;

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
                            color: 'white',
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
                        {pages.map((page) => {
                            return (!userData && page.permLevel === 0) ||
                                (userData &&
                                    userData.permission >= page.permLevel) ? (
                                <Button
                                    component={Link}
                                    to={page.ref}
                                    key={page.name}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                    }}
                                >
                                    {page.name}
                                </Button>
                            ) : null;
                        })}
                    </Box>

                    {userData ? (
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
                                        Account Settings
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
                    setLoginModalOpen={setLoginOpen}
                    setSignupModalOpen={setSignupOpen}
                    setUserData={setUserData}
                />
            ) : null}
            {signupOpen ? (
                <SignupModal
                    open={signupOpen}
                    setLoginModalOpen={setLoginOpen}
                    setSignupModalOpen={setSignupOpen}
                    setUserData={setUserData}
                />
            ) : null}
            <Outlet />
        </Box>
    );
};
export default App;
