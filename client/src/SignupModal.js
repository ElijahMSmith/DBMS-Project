import { useState, useEffect } from 'react';
import {
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
import UniversityAutocomplete from './components/UniversityAutocomplete';

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

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [university, setUniversity] = useState(null);
    const [universitiesList, setUniversitiesList] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        axios
            .get('http://localhost:1433/universities/')
            .then((resp) => {
                if (resp.status === 200) {
                    setUniversitiesList(
                        resp.data.universities.map((univ) => {
                            return {
                                name: univ.name,
                                unid: univ.unid,
                            };
                        })
                    );
                } else {
                    console.log(
                        'GET all universities returned code ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => console.log(err));
    }, [open]);

    const submitRegistration = () => {
        if (username === '' || email === '' || password === '' || !university) {
            setErrorMsg('One or more fields are empty.');
            return;
        }

        axios
            .post('http://localhost:1433/auth/register', {
                email,
                username,
                password,
                unid: university.unid,
            })
            .then((resp) => {
                // Good
                const { email, permLevel, uid, unid, username } = resp.data;
                setUserData(new User(username, email, uid, unid, permLevel));
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
            <Box
                sx={style}
                component="form"
                autoComplete="off"
                onSubmit={(e) => e.preventDefault()}
            >
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
                        inputProps={{ maxLength: 64 }}
                    />
                    <TextField
                        required
                        type="email"
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        inputProps={{ maxLength: 64 }}
                    />
                    <TextField
                        required
                        type="password"
                        label="Password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        inputProps={{ maxLength: 64 }}
                    />

                    <UniversityAutocomplete
                        value={university}
                        allUniversities={universitiesList}
                        setUniversity={setUniversity}
                    />

                    <Divider />

                    <Button
                        variant="contained"
                        type="submit"
                        onClick={submitRegistration}
                    >
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
