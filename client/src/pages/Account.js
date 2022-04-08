import { useEffect, useState } from 'react';
import { TextField, Box, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import User from '../classes/User';
import UniversityAutocomplete from '../components/UniversityAutocomplete';

const Account = (props) => {
    let { userData, setUserData } = props;

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [university, setUniversity] = useState(null);
    const [universitiesList, setUniversitiesList] = useState([]);

    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const createSnackbar = (msg, severity) => {
        setSnackbarOpen(true);
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
    };

    const submitEdits = () => {
        if (username === '') {
            createSnackbar('Username cannot be empty!', 'error');
            return;
        } else if (email === '') {
            createSnackbar('Email cannot be empty!', 'error');
            return;
        } else if (!university) {
            createSnackbar('University cannot be empty!', 'error');
            return;
        }

        axios
            .post('http://localhost:1433/auth/update', {
                uid: userData.uid,
                email,
                username,
                unid: university.unid,
            })
            .then((resp) => {
                if (resp.status !== 200) {
                    console.error(
                        'POST updates to user returned ' + resp.status
                    );
                    console.log(resp.data);
                } else {
                    setUserData(
                        new User(
                            username,
                            email,
                            userData.uid,
                            university.unid,
                            userData.permLevel
                        )
                    );
                    createSnackbar(
                        'Successfully updated information!',
                        'success'
                    );
                }
            })
            .catch((err) => {
                console.error(err);
                createSnackbar('Something went wrong.', 'error');
            });
    };

    useEffect(() => {
        if (!userData) return;
        setUsername(userData.username);
        setEmail(userData.email);

        // Get list of all universities and unids
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

                    for (let univ of resp.data.universities) {
                        if (univ.unid === userData.unid) {
                            setUniversity({ name: univ.name, unid: univ.unid });
                            break;
                        }
                    }
                } else {
                    console.error(
                        'GET all universities returned code ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => console.error(err));
    }, [userData]);

    return (
        <Box
            component="form"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
            sx={{ textAlign: 'center' }}
        >
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!username}
                sx={{ width: 300, mb: 3, mt: 10 }}
            />

            <br />

            <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!email}
                sx={{ width: 300, mb: 3 }}
            />

            <br />

            <UniversityAutocomplete
                value={university}
                allUniversities={universitiesList}
                setUniversity={setUniversity}
            />

            <br />

            <Button
                variant="contained"
                type="submit"
                onClick={submitEdits}
                sx={{ width: 200 }}
            >
                Submit Changes
            </Button>

            <Snackbar
                open={snackbarOpen}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                autoHideDuration={5000}
                onClose={() => setSnackbarOpen(false)}
                sx={{ width: '400px' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Account;
