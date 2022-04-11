import MapPicker from 'react-google-map-picker';
import {
    Box,
    Button,
    Grid,
    Modal,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ObjListAutocomplete from '../../components/ObjListAutocomplete';
import { handleError } from '../..';

// Default to UCF area
const DefaultLocation = { lat: 28.602307480049603, lng: -81.20016915689729 };
const DefaultZoom = 10;

// Event Visibility
const PUBLIC = 1;
const UNI = 2;
const RSO = 3;

// Modal Operation
const CREATE = 1;
const EDIT = 2;
const VIEW = 3;
const CLOSED = 4;

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 750,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const formatDate = (date) => {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
};

const EventModal = (props) => {
    const {
        open,
        mode,
        event,
        setModalOpen,
        joinedRSOs,
        setSnackbar,
        refreshEvents,
        userData,
    } = props;

    console.log(event);

    const {
        eid = '',
        unid = '',
        uniName = '',
        rsoid = '',
        rsoName = '',
        uid = '',
        name = '',
        description = '',
        category = '',
        time = '',
        date = new Date(),
        location = DefaultLocation,
        contactPhone = '',
        contactEmail = '',
        visibility = PUBLIC,
        published = false,
    } = event;

    const [eventName, setEventName] = useState(name);
    const [eventDescription, setEventDescription] = useState(description);
    const [eventCategory, setEventCategory] = useState(category);
    const [eventDate, setEventDate] = useState(date);
    const [eventTime, setEventTime] = useState(time);
    const [eventLocation, setEventLocation] = useState(location);
    const [eventContactPhone, setEventContactPhone] = useState(contactPhone);
    const [eventContactEmail, setEventContactEmail] = useState(contactEmail);
    const [eventVisibility, setEventVisibility] = useState(visibility);

    useEffect(() => {
        setEventName(name);
        setEventDescription(description);
        setEventCategory(category);
        setEventDate(date);
        setEventTime(time);
        setEventLocation(location);
        setEventContactPhone(contactPhone);
        setEventContactEmail(contactEmail);
        setEventVisibility(visibility);
    }, [open]);

    return (
        <Modal open={open} onClose={() => setModalOpen(false)}>
            <Box sx={style}>
                {mode === VIEW ? (
                    <>
                        <Typography
                            variant="h4"
                            sx={{ textAlign: 'center', mt: 3, mb: 6 }}
                        >
                            {eventName}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            {eventDescription}
                        </Typography>
                        <Typography sx={{ mt: 1, mb: 6, textAlign: 'center' }}>
                            {formatDate(eventDate) + ' @ ' + eventTime}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Hosted By</u>:{' '}
                            {eventVisibility !== RSO ? uniName : rsoName}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Location</u>:{' '}
                            {eventLocation
                                ? eventLocation.lat + ', ' + eventLocation.lng
                                : ''}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Category</u>: {eventCategory}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Contact</u>:{' '}
                            {eventContactEmail + ', ' + eventContactPhone}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Visibility</u>:{' '}
                            {eventVisibility === PUBLIC
                                ? 'Everyone'
                                : eventVisibility === UNI
                                ? uniName + ' Students'
                                : rsoName + ' Members'}
                        </Typography>
                    </>
                ) : (
                    <Stack spacing={3}>
                        <h1>
                            TODO:
                            https://developers.google.com/maps/documentation/javascript/cloud-setup
                        </h1>

                        <Typography variant="h4" sx={{ textAlign: 'center' }}>
                            {mode === EDIT ? 'Edit' : 'Create New'} RSO
                        </Typography>

                        <TextField
                            required
                            label="Event Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setEventName(e.target.value)}
                            inputProps={{ maxLength: 40 }}
                            sx={{ width: '100%' }}
                            helperText={`${name.length}/40`}
                            error={name.length === 0}
                        />
                    </Stack>
                )}
            </Box>
        </Modal>
    );
};

export default EventModal;
