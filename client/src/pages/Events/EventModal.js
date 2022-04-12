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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useEffect, useState } from 'react';
import ObjListAutocomplete from '../../components/ObjListAutocomplete';
import CategoryAutocomplete from '../../components/CategoryAutocomplete';
import { Map } from 'pigeon-maps';
import { osm } from 'pigeon-maps/providers';
import { format } from 'fecha';
import axios from 'axios';
import { handleError } from '../..';

// Default to UCF area
const DefaultLocation = [28.602307480049603, -81.20016915689729];

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

const dtDisplayFormat = 'YYYY-MM-DD @ HH:mm:ss';

const dtValid = (dt) => {
    return dt != 'Invalid Date';
};

const formatDate = (dateTime) => {
    return dateTime.toISOString().slice(0, 19).replace('T', ' ');
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
        unid,
        uniName = '',
        rsoid,
        rsoName = '',
        uid,
        name = '',
        description = '',
        category = '',
        datetime = new Date(),
        location = '',
        lat = DefaultLocation[0],
        lng = DefaultLocation[1],
        contactPhone = '',
        contactEmail = '',
        published = false,
        approved = false,
    } = event;

    const [eventName, setEventName] = useState(name);
    const [eventDescription, setEventDescription] = useState(description);
    const [eventCategory, setEventCategory] = useState(category);
    const [eventVisibility, setEventVisibility] = useState(PUBLIC);
    const [eventRSO, setEventRSO] = useState(null);
    const [eventDateTime, setEventDateTime] = useState(datetime);
    const [eventLocation, setEventLocation] = useState(location);
    const [eventLat, setEventLat] = useState(lat);
    const [eventLng, setEventLng] = useState(lng);
    const [eventContactPhone, setEventContactPhone] = useState(contactPhone);
    const [eventContactEmail, setEventContactEmail] = useState(contactEmail);
    const [page, setPage] = useState(0);
    const [zoom, setZoom] = useState(15);
    const [center, setCenter] = useState(DefaultLocation);

    useEffect(() => {
        setEventName(name);
        setEventDescription(description);
        setEventCategory(category);
        setEventDateTime(datetime);
        setEventLocation(location);
        setEventLat(lat);
        setEventLng(lng);
        setEventContactPhone(contactPhone);
        setEventContactEmail(contactEmail);
        setEventVisibility(PUBLIC);
        setPage(0);
        setCenter([lat, lng]);
        setZoom(15);

        if (!rsoid) setEventRSO(null);
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
            if (
                eventName === '' ||
                eventDescription === '' ||
                eventCategory === '' ||
                !dtValid(eventDateTime)
            )
                return false;
            if (mode === CREATE) {
                if (
                    typeof eventVisibility !== 'number' ||
                    eventVisibility < 1 ||
                    eventVisibility > 3
                )
                    return false;

                if (eventVisibility === UNI && unid === '') return false;
                if (eventVisibility === RSO && eventRSO === null) return false;
            }
            return true;
        } else {
            //pnum === 1
            if (
                eventContactPhone === '' ||
                eventContactEmail === '' ||
                !dtValid(eventDateTime) ||
                eventLocation === '' ||
                isNaN(eventLat) ||
                isNaN(eventLng)
            )
                return false;
            return true;
        }
    };

    const handlePageTrans = (direction) => {
        if (page === 0) {
            if (direction === PREV) return;
            if (validatePage(0)) setPage(1);
        } else {
            // page === 1
            if (direction === PREV) {
                setPage(0);
                return;
            }
            if (validatePage(0) && validatePage(1)) {
                if (mode === EDIT) {
                    axios
                        .post(`http://localhost:1433/events/`, {
                            eid,
                            uid,
                            unid,
                            rsoid,
                            name: eventName,
                            description: eventDescription,
                            category: eventCategory,
                            datetime: formatDate(eventDateTime),
                            location: eventLocation,
                            lat: eventLat,
                            lng: eventLng,
                            contactPhone: eventContactPhone,
                            contactEmail: eventContactEmail,
                            published,
                            approved,
                        })
                        .then((res) => {
                            setModalOpen(false);
                            setSnackbar(
                                true,
                                'success',
                                'Edits saved successfully!'
                            );
                            refreshEvents();
                        })
                        .catch((err) => handleError(err));
                } else if (mode === CREATE) {
                    axios
                        .post(`http://localhost:1433/events/`, {
                            uid: userData.uid,
                            unid:
                                eventVisibility === UNI
                                    ? userData.unid
                                    : undefined,
                            rsoid:
                                eventVisibility === RSO
                                    ? eventRSO.rsoid
                                    : undefined,
                            name: eventName,
                            description: eventDescription,
                            category: eventCategory,
                            datetime: formatDate(eventDateTime),
                            location: eventLocation,
                            lat: eventLat,
                            lng: eventLng,
                            contactPhone: eventContactPhone,
                            contactEmail: eventContactEmail,
                            published:
                                eventVisibility === PUBLIC ? false : true,
                            approved: eventVisibility === PUBLIC ? false : true,
                        })
                        .then((res) => {
                            // TODO
                            refreshEvents();
                        })
                        .catch((err) => {
                            handleError(err);
                        });
                }
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
                            sx={{ textAlign: 'center', mt: 3, mb: 5 }}
                        >
                            {eventName}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            {eventDescription}
                        </Typography>
                        <Typography sx={{ mt: 1, mb: 5, textAlign: 'center' }}>
                            {format(eventDateTime, dtDisplayFormat)}
                        </Typography>
                        {rsoid ? (
                            <Typography sx={{ my: 1, textAlign: 'center' }}>
                                <u>Hosted By</u>: {rsoName}
                            </Typography>
                        ) : unid ? (
                            <Typography sx={{ my: 1, textAlign: 'center' }}>
                                <u>Hosted By</u>: {uniName}
                            </Typography>
                        ) : (
                            <Typography sx={{ my: 1, textAlign: 'center' }}>
                                Open to Public
                            </Typography>
                        )}
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Category</u>: {eventCategory}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Contact</u>:{' '}
                            {eventContactEmail + ', ' + eventContactPhone}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Location</u>: {eventLocation}
                        </Typography>
                        <Typography sx={{ my: 1, textAlign: 'center' }}>
                            <u>Coordinates</u>: {lat + ', ' + lng}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Map
                                provider={osm}
                                height={300}
                                center={center}
                                zoom={zoom}
                                touchEvents={false}
                                mouseEvents={false}
                            />
                        </Box>
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
                                <CategoryAutocomplete
                                    value={
                                        eventCategory === ''
                                            ? null
                                            : eventCategory
                                    }
                                    setCategory={setEventCategory}
                                    width="100%"
                                />

                                {mode === CREATE ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <ObjListAutocomplete
                                            allOptions={visibilityOptions}
                                            value={
                                                visibilityOptions[
                                                    eventVisibility === PUBLIC
                                                        ? 0
                                                        : eventVisibility ===
                                                          UNI
                                                        ? 1
                                                        : 2
                                                ]
                                            }
                                            setOption={(newValue) =>
                                                setEventVisibility(
                                                    newValue.value
                                                )
                                            }
                                            label="Visibility"
                                            width="45%"
                                            defaultValue={PUBLIC}
                                        />
                                        {eventVisibility === UNI ? (
                                            // Render disabled field with user's university
                                            <TextField
                                                required
                                                label="University"
                                                variant="outlined"
                                                value={uniName}
                                                sx={{ width: '45%' }}
                                                error={uniName === ''}
                                                disabled
                                            />
                                        ) : eventVisibility === RSO ? (
                                            // Render RSO picker
                                            <ObjListAutocomplete
                                                allOptions={joinedRSOs}
                                                value={eventRSO}
                                                setOption={setEventRSO}
                                                label="RSO"
                                                width="45%"
                                            />
                                        ) : null}
                                    </Box>
                                ) : null}

                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DateTimePicker
                                        label="Date and Time"
                                        value={eventDateTime}
                                        onChange={(newValue) =>
                                            setEventDateTime(newValue)
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Stack>
                        ) : (
                            // Page === 1
                            <Stack spacing={3}>
                                <TextField
                                    required
                                    label="Location Name"
                                    variant="outlined"
                                    value={eventLocation}
                                    onChange={(e) =>
                                        setEventLocation(e.target.value)
                                    }
                                    inputProps={{ maxLength: 64 }}
                                    sx={{ width: '100%' }}
                                    helperText={`${eventLocation.length}/64`}
                                    error={eventLocation.length === 0}
                                />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <TextField
                                        required
                                        label="Contact Phone Number"
                                        variant="outlined"
                                        value={eventContactPhone}
                                        onChange={(e) =>
                                            setEventContactPhone(e.target.value)
                                        }
                                        inputProps={{ maxLength: 16 }}
                                        sx={{ width: '45%' }}
                                        helperText={`${eventContactPhone.length}/16`}
                                        error={eventContactPhone.length === 0}
                                    />
                                    <TextField
                                        required
                                        label="Contact Email"
                                        variant="outlined"
                                        value={eventContactEmail}
                                        onChange={(e) =>
                                            setEventContactEmail(e.target.value)
                                        }
                                        inputProps={{ maxLength: 64 }}
                                        sx={{ width: '45%' }}
                                        helperText={`${eventContactEmail.length}/64`}
                                        error={eventContactEmail.length === 0}
                                    />
                                </Box>
                                <TextField
                                    disabled
                                    value={eventLat + ', ' + eventLng}
                                    sx={{ width: '100%' }}
                                />
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Map
                                        provider={osm}
                                        height={300}
                                        center={center}
                                        zoom={zoom}
                                        onBoundsChanged={({ center, zoom }) => {
                                            setCenter(center);
                                            setZoom(zoom);
                                        }}
                                        mouseEvents
                                        onClick={(data) => {
                                            setEventLat(data.latLng[0]);
                                            setEventLng(data.latLng[1]);
                                            setCenter(data.latLng);
                                        }}
                                    />
                                </Box>
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
