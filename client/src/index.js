import { useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import RSOs from './pages/RSOs';
import Universities from './pages/Universities';
import MyEvents from './pages/MyEvents';
import Account from './pages/Account';
import { Typography } from '@mui/material';

const container = document.getElementById('root');
const root = createRoot(container);

const ContainerComponent = () => {
    const [userData, setUserData] = useState(null);
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <App userData={userData} setUserData={setUserData} />
                    }
                >
                    <Route
                        path=""
                        element={
                            <Home
                                userData={userData}
                                setUserData={setUserData}
                            />
                        }
                    />
                    <Route
                        path="rsos"
                        element={
                            <RSOs
                                userData={userData}
                                setUserData={setUserData}
                            />
                        }
                    />
                    <Route
                        path="universities"
                        element={
                            <Universities
                                userData={userData}
                                setUserData={setUserData}
                            />
                        }
                    />
                    <Route
                        path="myevents"
                        element={
                            <MyEvents
                                userData={userData}
                                setUserData={setUserData}
                            />
                        }
                    />
                    <Route
                        path="account"
                        element={
                            <Account
                                userData={userData}
                                setUserData={setUserData}
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
        </BrowserRouter>
    );
};

root.render(
    <StrictMode>
        <ContainerComponent />
    </StrictMode>
);
