import MapPicker from 'react-google-map-picker';
import {
    Box,
    Button,
    Grid,
    Grow,
    Modal,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ObjListAutocomplete from '../../components/ObjListAutocomplete';
import { handleError } from '../..';
import CategoryAutocomplete from '../../components/CategoryAutocomplete';

// Default to UCF area
const DefaultLocation = { lat: 28.602307480049603, lng: -81.20016915689729 };
const DefaultZoom = 10;

// Event Visibility
const PUBLIC = 1;
const UNI = 2;
const RSO = 3;

const visibilityOptions = [
    { name: 'Public', value: PUBLIC },
    { name: 'My University Only', value: UNI },
    { name: 'My RSO Only', value: RSO },
];

// Modal Operation
const CREATE = 1;
const EDIT = 2;
const VIEW = 3;
const CLOSED = 4;

// Page Direction
const PREV = -1;
const NEXT = 1;

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

const steps = ['Event Info', 'Event Details'];

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
    const [eventVisibility, setEventVisibility] = useState(visibility);
    const [eventRSO, setEventRSO] = useState(null);
    const [eventDate, setEventDate] = useState(date);
    const [eventTime, setEventTime] = useState(time);
    const [eventLocation, setEventLocation] = useState(location);
    const [eventContactPhone, setEventContactPhone] = useState(contactPhone);
    const [eventContactEmail, setEventContactEmail] = useState(contactEmail);
    const [page, setPage] = useState(0);

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
        setPage(0);

        if (rsoid === '') setEventRSO(null);
        else {
            for (let irso of joinedRSOs) {
                if (irso.rsoid === rsoid) {
                    setEventRSO(irso);
                    break;
                }
            }
        }
    }, [open]);

    const validatePage = (pnum) => {
        if (pnum === 0) {
            if (eventVisibility === RSO && eventRSO === null) return false;
            if (
                eventName === '' ||
                eventDescription === '' ||
                eventCategory === ''
            )
                return false;
            if (
                typeof eventVisibility !== 'number' ||
                eventVisibility < 1 ||
                eventVisibility > 3
            )
                return false;
            return true;
        } else {
            // TODO: validate page 1
            return false;
        }
    };

    const handlePageTrans = (direction) => {
        if (page === 0) {
            if (direction === PREV) return;
            if (validatePage(0)) setPage(1);
        } else { // page === 1
            if (direction === PREV) setPage(0);
            else if(validatePage(0) && validatePage(1)){
                // TODO: submit event for editing/creation
            }
        }
    };

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
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{ textAlign: 'center', mb: 3 }}
                        >
                            {mode === EDIT ? 'Edit' : 'Create New'} Event
                        </Typography>
                        {page === 0 ? (
                            <Stack spacing={3}>
                                <TextField
                                    required
                                    label="Event Name"
                                    variant="outlined"
                                    value={eventName}
                                    onChange={(e) =>
                                        setEventName(e.target.value)
                                    }
                                    inputProps={{ maxLength: 36 }}
                                    sx={{ width: '100%' }}
                                    helperText={`${eventName.length}/36`}
                                    error={eventName.length === 0}
                                />
                                <TextField
                                    required
                                    label="Description"
                                    variant="outlined"
                                    value={eventDescription}
                                    onChange={(e) =>
                                        setEventDescription(e.target.value)
                                    }
                                    multiline
                                    rows={4}
                                    inputProps={{ maxLength: 512 }}
                                    sx={{ width: '100%' }}
                                    helperText={`${eventDescription.length}/512`}
                                    error={eventDescription.length === 0}
                                />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <CategoryAutocomplete
                                        value={
                                            eventCategory === ''
                                                ? null
                                                : eventCategory
                                        }
                                        setCategory={setEventCategory}
                                        width="45%"
                                    />
                                    <ObjListAutocomplete
                                        allOptions={visibilityOptions}
                                        value={
                                            visibilityOptions[
                                                eventVisibility === PUBLIC
                                                    ? 0
                                                    : eventVisibility === UNI
                                                    ? 1
                                                    : 2
                                            ]
                                        }
                                        setOption={(newValue) =>
                                            setEventVisibility(newValue.value)
                                        }
                                        label="Visibility"
                                        width="45%"
                                        defaultValue={PUBLIC}
                                    />
                                </Box>

                                {eventVisibility === PUBLIC ||
                                eventVisibility === UNI ? (
                                    // Render disabled field with user's university

                                    <TextField
                                        required
                                        label="University"
                                        variant="outlined"
                                        value={uniName}
                                        sx={{ width: '100%' }}
                                        error={uniName === ''}
                                        disabled
                                    />
                                ) : (
                                    // Render RSO picker
                                    <ObjListAutocomplete
                                        allOptions={joinedRSOs}
                                        value={eventRSO}
                                        setOption={setEventRSO}
                                        label="RSO"
                                        width="100%"
                                    />
                                )}

                                {/* Name, description, category, visibility,
                                RSO/UNI picker based on visibility */}
                            </Stack>
                        ) : (
                            // Page === 1
                            /*
                        eid CHAR(36) PRIMARY KEY,
                        uid CHAR(36),
                        unid CHAR(36),
                        rsoid CHAR(36),
                        name VARCHAR(36),
                        description VARCHAR(512),
                        category VARCHAR(36),
                        time TIME,
                        date DATE,
                        location VARCHAR(64),
                        contactPhone VARCHAR(16),
                                contactEmail VARCHAR(64),*/
                            // Date picker/Time picker one line
                            // Contact email/phone one line
                            // Location picker
                            <Stack spacing={3}>
                                <TextField
                                    required
                                    label="Event Name"
                                    variant="outlined"
                                    value={name}
                                    onChange={(e) =>
                                        setEventName(e.target.value)
                                    }
                                    inputProps={{ maxLength: 40 }}
                                    sx={{ width: '100%' }}
                                    helperText={`${name.length}/40`}
                                    error={name.length === 0}
                                />
                            </Stack>
                        )}

                        <Box
                            sx={{
                                mt: 5,
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={(e) => handlePageTrans(PREV)}
                                sx={{ height: 50, width: 100 }}
                            >
                                Previous
                            </Button>
                            <Stepper activeStep={page} alternativeLabel>
                                {steps.map((label, index) => {
                                    return (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                            <Button
                                variant="contained"
                                onClick={(e) => handlePageTrans(NEXT)}
                                sx={{ height: 50, width: 100 }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default EventModal;
