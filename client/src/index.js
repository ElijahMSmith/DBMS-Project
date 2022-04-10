import { useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Universitydetails from './pages/universitydetails';
import RSOSearch from './pages/RSO-related/RSOSearch';
import Universities from './pages/Universities';
import MyEvents from './pages/MyEvents';
import Account from './pages/Account';
import { Alert, Snackbar, Typography } from '@mui/material';

const container = document.getElementById('root');
const root = createRoot(container);

const ContainerComponent = () => {
    const [userData, setUserData] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarMessage, setSnackbarMessage] = useState(
        'Logged in successfully!'
    );

    const setSnackbar = (open, severity, message) => {
        setSnackbarOpen(open);
        setSnackbarSeverity(severity);
        setSnackbarMessage(message);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <App
                            userData={userData}
                            setUserData={setUserData}
                            setSnackbar={setSnackbar}
                        />
                    }
                >
                    <Route
                        path=""
                        element={
                            <Home
                                userData={userData}
                                setUserData={setUserData}
                                setSnackbar={setSnackbar}
                            />
                        }
                    />
                    <Route
                        path="rsos"
                        element={
                            <RSOSearch
                                userData={userData}
                                setUserData={setUserData}
                                setSnackbar={setSnackbar}
                            />
                        }
                    />
                    <Route
                        path="universities"
                        element={
                            <Universities
                                userData={userData}
                                setUserData={setUserData}
                                setSnackbar={setSnackbar}
                            />
                        }
                    />
                    <Route
                        path="university/details"
                        element={
                            <Universitydetails
                                userData={userData}
                                setUserData={setUserData}
                            />
                        }/>
                    <Route
                        path="myevents"
                        element={
                            <MyEvents
                                userData={userData}
                                setUserData={setUserData}
                                setSnackbar={setSnackbar}
                            />
                        }
                    />
                    <Route
                        path="account"
                        element={
                            <Account
                                userData={userData}
                                setUserData={setUserData}
                                setSnackbar={setSnackbar}
                            />
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Typography
                                variant="h4"
                                sx={{ textAlign: 'center', mt: 50 }}
                            >
                                404 - There's nothing here!
                            </Typography>
                        }
                    />
                </Route>
            </Routes>
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
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </BrowserRouter>
    );
};

root.render(
    <StrictMode>
        <ContainerComponent />
    </StrictMode>
);
