import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const LoginModal = (props) => {
    let {
        open = false,
        setLoginModalOpen,
        setSignupModalOpen,
        setUserData,
    } = props;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div>
            <Modal open={open} onClose={() => setLoginModalOpen(false)}>
                <Box sx={style}>
                    <Typography
                        variant="h4"
                        sx={{ pb: 2, textAlign: 'center' }}
                    >
                        Login
                    </Typography>
                    <Stack spacing={1}>
                        <TextField
                            required
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            required
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Divider />
                        <Button
                            variant="contained"
                            onClick={() => {
                                console.log(username);
                                console.log(password);
                            }}
                        >
                            Log In
                        </Button>
                    </Stack>
                    <Typography sx={{ mt: 2, textAlign: 'center' }}>
                        Don't have an account?{' '}
                        <Link
                            onClick={() => {
                                setLoginModalOpen(false);
                                setSignupModalOpen(true);
                            }}
                        >
                            Sign up here
                        </Link>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
};

export default LoginModal;
