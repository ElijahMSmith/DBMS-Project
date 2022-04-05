import { useState } from 'react';
import {
    Autocomplete,
    TextField,
    Button,
    Box,
    Typography,
    Modal,
    Stack,
    Divider,
    Link,
} from '@mui/material';
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

const SignupModal = (props) => {
    let {
        open = false,
        setLoginModalOpen,
        setSignupModalOpen,
        setUserData,
        setSnackbar,
    } = props;

    const universities = [
        'University of Central Florida',
        'University of South Florida',
        'University of North Florida',
        'University of Pennsylvania',
    ];

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [university, setUniversity] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const submitRegister = () => {
        if (
            username === '' ||
            email === '' ||
            password === '' ||
            university === ''
        ) {
            setErrorMsg('One or more fields are empty.');
            return;
        }

        axios
            .post('http://localhost:1433/auth/register', {
                email,
                username,
                password,
                unid: 'notarealunid', // TODO: Obtain unid from an endpoint and put here
            })
            .then((resp) => {
                // Good
                const { uid, username, email, unid, permLevel } = resp.data;
                setUserData(new User(uid, username, email, unid, permLevel));
                setErrorMsg('');
                setSnackbar(true, 'success', 'Registered successfully!');
                setSignupModalOpen(false);
            })
            .catch((err) => {
                if (err.response && err.response.status === 406)
                    setErrorMsg('That email is already in use!');
                else {
                    setErrorMsg('An unexpected error occurred.');
                    console.log(err);
                }
            });
    };

    return (
        <Modal open={open} onClose={() => setSignupModalOpen(false)}>
            <Box sx={style}>
                <Typography variant="h4" sx={{ pb: 2, textAlign: 'center' }}>
                    Create New Account
                </Typography>
                <Stack spacing={1}>
                    <TextField
                        required
                        type="text"
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        required
                        type="email"
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        required
                        type="password"
                        label="Password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Autocomplete
                        disablePortal
                        options={universities}
                        onChange={(e, newValue) => {
                            console.log('test');
                            console.log(newValue);
                            setUniversity(newValue ?? '');
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="University"
                                value={university}
                                required
                            />
                        )}
                    />
                    <Divider />
                    <Button variant="contained" onClick={submitRegister}>
                        Create
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
                    Already have an account?{' '}
                    <Link
                        onClick={() => {
                            setLoginModalOpen(true);
                            setSignupModalOpen(false);
                        }}
                    >
                        Log in
                    </Link>
                </Typography>
            </Box>
        </Modal>
    );
};

export default SignupModal;
