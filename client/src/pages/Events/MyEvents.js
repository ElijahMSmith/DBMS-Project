import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Grid,
    Stack,
} from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { handleError } from '../..';
import EventModal from './EventModal';
import EventCard from '../../components/EventCard';

// Event Visibility
const PUBLIC = 1;
const UNI = 2;
const RSO = 3;

// Modal Operation
const CREATE = 1;
const VIEW = 3;
const CLOSED = 4;

const MyEvents = (props) => {
    const { userData, setUserData, setSnackbar } = props;

    const [eventList, setEventList] = useState([]);
    const [uniList, setUniList] = useState([]);
    const [rsoList, setRSOList] = useState([]);
    const [ownedRSOsList, setOwnedRSOsList] = useState([]);
    const [uniName, setUniName] = useState('');

    // Which events are included in the display
    const [checkboxes, setCheckboxes] = useState({
        unapproved: false,
        myEvents: true,
    });

    const [currentEvent, setCurrentEvent] = useState(null);
    const [modalOp, setModalOp] = useState(CLOSED);
    const [modalOpen, setModalOpen] = useState(false);

    const refreshEvents = async () => {
        if (!userData) return;

        let res;

        try {
            if (checkboxes.unapproved)
                res = await axios.get(`http://localhost:1433/events/owned/`);
            else if (checkboxes.myEvents)
                res = await axios.get(
                    `http://localhost:1433/events/owned/?uid=${userData.uid}&all`
                );

            if (res.status === 200) {
                if (checkboxes.unapproved) {
                    res.data.events = res.data.events.filter(
                        (e) => !e.approved
                    );
                }

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
            }
        } catch (err) {
            handleError(err);
        }
    };

    const getRSOs = async () => {
        // Get list of all RSOs
        const owned = [];
        let res = await axios.get('http://localhost:1433/rsos');
        if (res.status === 200) {
            setRSOList(res.data.rsos);
            console.log('Successfully retrieved all rsos');

            for (let irso of res.data.rsos)
                if (irso.uid === userData.uid) owned.push(irso);
            setOwnedRSOsList(owned);
        } else console.error(res.data);
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
                    for (let uni of resp.data.universities) {
                        if (uni.unid === userData.unid) setUniName(uni.name);
                    }
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
        if (!userData) return;
        getRSOs().then(() => getUniversities());
    }, [userData]);

    useEffect(() => {
        if (!userData) return;
        refreshEvents();
    }, [checkboxes, uniList, rsoList, userData]);

    // ADMINS:
    // MANAGE mode only
    // SUPERADMINS
    // MANAGE or APPROVE mode

    /*
        Manage mode - 
        1. Create a new event with a button press
        2. View all events from RSOs you own (edit/view/delete them here as well)

        Approve mode -
        1. View all unapproved events for universities that you own
        2. View in modal button and button for approving/rejecting
    */
    return (
        <Box sx={{ mt: 2, ml: 2 }}>
            <FormGroup sx={{ display: 'inline' }}>
                {userData ? (
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={(e) => {
                            setModalOp(CREATE);
                            setModalOpen(true);
                        }}
                        sx={{ mx: 2, height: 40 }}
                    >
                        Create Event
                    </Button>
                ) : null}
                {userData && userData.permLevel === 3 ? (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={checkboxes.unapproved}
                                onChange={() =>
                                    setCheckboxes({
                                        unapproved: true,
                                        myEvents: false,
                                    })
                                }
                            />
                        }
                        label="Show Unapproved Events"
                    />
                ) : null}

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checkboxes.myEvents}
                            onChange={() =>
                                setCheckboxes({
                                    unapproved: false,
                                    myEvents: true,
                                })
                            }
                        />
                    }
                    label="Show My Events"
                />
            </FormGroup>
            <Grid container spacing={2}>
                {eventList.map((cardEvent) => {
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
                                approving={checkboxes.unapproved}
                            />
                        </Grid>
                    );
                })}
            </Grid>
            <EventModal
                open={modalOpen}
                setModalOpen={setModalOpen}
                setMode={setModalOp}
                event={currentEvent ?? { uniName }}
                mode={modalOp}
                rsoOptions={ownedRSOsList}
                setSnackbar={setSnackbar}
                refreshEvents={refreshEvents}
                userData={userData}
            />
        </Box>
    );
};

export default MyEvents;
