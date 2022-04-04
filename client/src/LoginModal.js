import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

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
    let { open = false, setOpen, setUserData, handleFormSubmit } = props;

    return (
        <div>
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={style}>
                    <Typography
                        id="modal-modal-title"
                        variant="h4"
                        component="h2"
                        pb={2}
                    >
                        Login
                    </Typography>
                    {/* To include: Actually make the dang thing functional */}
                    <Stack spacing={1}>
                        <TextField required label="Username" variant="outlined" />
                        <TextField required type="password" label="Password" variant="outlined" />
                        <Divider />
                        <Button variant="contained">Log In</Button>
                    </Stack>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Don't have an account? Sign up here:
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
};

export default LoginModal;
