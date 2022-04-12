import {
    Button,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    TextField,
    Stack,
    Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { handleError } from '../..';
import EventCard from '../../components/EventCard';
import EventModal from './EventModal';
import Event from '../../classes/Event';

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
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const Home = (props) => {
    const { userData, setUserData, setSnackbar } = props;

    const [eventList, setEventList] = useState([]);
    const [rsoList, setRSOList] = useState([]);
    const [joinedRSOList, setJoinedRSOList] = useState([]);
    const [uniList, setUniList] = useState([]);

    // Which events are included in the display
    const [checkboxes, setCheckboxes] = useState({
        public: false,
        uni: false,
        rso: false,
    });
    const [date, setDate] = useState();

    const [currentEvent, setCurrentEvent] = useState(null);

    const [modalOp, setModalOp] = useState(CLOSED);
    const [modalOpen, setModalOpen] = useState(false);

    const dateValid = () => !date || date.toString() === 'Invalid Date';

    const refreshEvents = async () => {
        // Populate allEvents
        let res;
        if (userData)
            res = await axios.get(
                `http://localhost:1433/events/?uid=${userData.uid}&all`
            );
        else res = await axios.get(`http://localhost:1433/events/?all`);

        if (res.status === 200) {
            for (let ievent of res.data.events) {
                if (ievent.unid !== null) {
                    for (let iuni of uniList) {
                        if (iuni.unid === ievent.unid) {
                            ievent.uniName = iuni.name;
                            break;
                        }
                    }
                } else if (ievent.rsoid !== null) {
                    for (let irso of rsoList) {
                        if (irso.rsoid === ievent.rsoid) {
                            ievent.rsoName = irso.name;
                            break;
                        }
                    }
                }
                ievent.datetime = new Date(ievent.datetime);
            }
            setEventList(res.data.events);
        } else console.error(res.data);
    };

    const getRSOs = async () => {
        // Get list of all RSOs
        let res = await axios.get('http://localhost:1433/rsos');
        if (res.status === 200) {
            setRSOList(res.data.rsos);
            console.log('Successfully retrieved all rsos');
        } else console.error(res.data);

        if (userData) {
            // Get list of RSOs the user has joined
            res = await axios.get(
                `http://localhost:1433/rsos/?uid=${userData.uid}`
            );
            if (res.status === 200) {
                setJoinedRSOList(res.data.rsos);
                console.log('Successfully retrieved joined rsos');
            } else console.error(res.data);
        }
    };

    const getUniversities = async () => {
        // Get list of all universities
        axios
            .get('http://localhost:1433/universities/')
            .then((resp) => {
                if (resp.status === 200) {
                    setUniList(
                        resp.data.universities.map((univ) => {
                            return {
                                name: univ.name,
                                unid: univ.unid,
                            };
                        })
                    );
                    console.log('Successfully retrieved universities');
                } else {
                    console.error(
                        'GET all universities returned code ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        getRSOs();
        getUniversities();
    }, [userData]);

    useEffect(() => {
        refreshEvents();
    }, [checkboxes, date, userData]);

    return (
        <Box sx={{ mt: 2, ml: 2 }}>
            <form onSubmit={(e) => e.preventDefault()} autoComplete="false">
                <Stack spacing={2}>
                    <FormGroup sx={{ display: 'inline-block' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DesktopDatePicker
                                label="Starting Cutoff"
                                inputFormat="MM/dd/yyyy"
                                value={date}
                                onChange={(newDate) => setDate(newDate)}
                                renderInput={(params) => (
                                    <TextField {...params} />
                                )}
                            />
                        </LocalizationProvider>
                    </FormGroup>

                    {userData ? (
                        <FormGroup sx={{ display: 'inline' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkboxes.public}
                                        onChange={(e, newValue) =>
                                            setCheckboxes({
                                                public: !checkboxes.public,
                                                uni: false,
                                                rso: false,
                                            })
                                        }
                                    />
                                }
                                label="Public Events Only"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkboxes.uni}
                                        onChange={(e, newValue) =>
                                            setCheckboxes({
                                                public: false,
                                                uni: !checkboxes.uni,
                                                rso: false,
                                            })
                                        }
                                    />
                                }
                                label="My University Only"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkboxes.rso}
                                        onChange={(e, newValue) =>
                                            setCheckboxes({
                                                public: false,
                                                uni: false,
                                                rso: !checkboxes.rso,
                                            })
                                        }
                                    />
                                }
                                label="Joined RSOs Only"
                            />
                        </FormGroup>
                    ) : null}
                </Stack>
            </form>
            <Grid container spacing={2}>
                {eventList.map((cardEvent) => {
                    if (!cardEvent.published) return null;
                    if (date && cardEvent.datetime < date) return null;
                    if (checkboxes.public) {
                        if (cardEvent.unid || cardEvent.rsoid) return null;
                    } else if (checkboxes.uni) {
                        if (cardEvent.unid !== userData.unid) return null;
                    } else if (checkboxes.rso) {
                        let found = false;
                        for (let irso of joinedRSOList) {
                            if (cardEvent.rsoid === irso.rsoid) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) return null;
                    }

                    return (
                        <Grid
                            key={cardEvent.eid}
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            xl={3}
                            sx={{ my: 2 }}
                        >
                            <EventCard
                                event={cardEvent}
                                setEvent={setCurrentEvent}
                                refreshEvents={refreshEvents}
                                setModalOp={setModalOp}
                                setModalOpen={setModalOpen}
                                userData={userData}
                                setSnackbar={setSnackbar}
                            />
                        </Grid>
                    );
                })}
            </Grid>
            <EventModal
                open={modalOpen}
                setModalOpen={setModalOpen}
                event={currentEvent ?? {}}
                mode={modalOp}
                joinedRSOs={joinedRSOList}
                setSnackbar={setSnackbar}
                refreshEvents={refreshEvents}
                userData={userData}
            />
        </Box>
    );
};

export default Home;
