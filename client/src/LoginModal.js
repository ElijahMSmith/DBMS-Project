import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from '@mui/material';
import axios from 'axios';
import User from './classes/User';

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
    const [errorMsg, setErrorMsg] = useState('');

    const submitLogin = () => {
        axios
            .post('http://localhost:1433/auth/login', { username, password })
            .then((resp) => {
                // Good
                const { uid, username, email, unid, permLevel } = resp.data;
                setUserData(new User(uid, username, email, unid, permLevel));
                setErrorMsg('');
                console.log('Signed in successfully!');
                setLoginModalOpen(false);
            })
            .catch((err) => {
                if (err.response && err.response.status === 406)
                    setErrorMsg('Incorrect username or password.');
                else {
                    setErrorMsg('An unexpected error occurred.');
                    console.log(err);
                }
            });
    };

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
                        <Button variant="contained" onClick={submitLogin}>
                            Log In
                        </Button>
                        {errorMsg !== '' ? (
                            <Typography
                                sx={{ color: 'red', textAlign: 'center' }}
                                variant="p"
                            >
                                {errorMsg}
                            </Typography>
                        ) : null}
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
