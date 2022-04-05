import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import RSOs from './pages/RSOs';
import Universities from './pages/Universities';
import MyEvents from './pages/MyEvents';
import { Typography } from '@mui/material';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route path="home" element={<Home />} />
                    <Route path="rsos" element={<RSOs />} />
                    <Route path="universities" element={<Universities />} />
                    <Route path="myevents" element={<MyEvents />} />
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
    </React.StrictMode>
);
