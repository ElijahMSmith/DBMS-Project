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
    const [publicOnly, setPublicOnly] = useState(false);
    const [myUniOnly, setMyUniOnly] = useState(false);
    const [joinedRSOsOnly, setJoinedRSOsOnly] = useState(false);
    const [date, setDate] = useState();

    const [currentEvent, setCurrentEvent] = useState(null);

    const [modalOp, setModalOp] = useState(CLOSED);
    const [modalOpen, setModalOpen] = useState(false);

    // TODO: remove later once we had endpoints
    const dummyEvent1 = {
        eid: 'eid1',
        unid: 'fd8fc3d3-824a-476b-9207-be5483ec1459',
        rsoid: '413d0363-c62b-4da0-bbc0-0303c319521d',
        uid: 'c2d22b9f-d07b-4399-ac31-221cd264de49',
        name: 'Public KnightHacks Event',
        description:
            'Public event description asdfasdfasdfasdfasdfasfasdfasdfasdfasdfasdfasdfa.',
        category: 'Presentation',
        time: '8:00PM',
        date: new Date('5/10/2022'),
        location: {
            lat: 28.60065314250197,
            lng: -81.197628058419,
        },
        contactPhone: '111-222-3333',
        contactEmail: 'notareal@email.com',
        visibility: PUBLIC,
        published: true,
        rsoName: 'Knight Hacks',
        uniName: 'University of Tentral Torida',
    };

    const dummyEvent2 = {
        eid: 'eid2',
        unid: 'fd8fc3d3-824a-476b-9207-be5483ec1459',
        rsoid: '413d0363-c62b-4da0-bbc0-0303c319521d',
        uid: 'c2d22b9f-d07b-4399-ac31-221cd264de49',
        name: 'Uni KnightHacks Event',
        description: 'Uni event description.',
        category: 'Fundraising',
        time: '8:30PM',
        date: new Date('5/11/2022'),
        location: {
            lat: 28.60291995566528,
            lng: -81.19859302988073,
        },
        contactPhone: '111-222-3334',
        contactEmail: 'notareal2@email.com',
        visibility: UNI,
        published: true,
        rsoName: 'Knight Hacks',
        uniName: 'University of Tentral Torida',
    };

    const dummyEvent3 = {
        eid: 'eid3',
        unid: 'fd8fc3d3-824a-476b-9207-be5483ec1459',
        rsoid: '413d0363-c62b-4da0-bbc0-0303c319521d',
        uid: 'c2d22b9f-d07b-4399-ac31-221cd264de49',
        name: 'RSO KnightHacks Event',
        description: 'RSO event description.',
        category: 'Networking',
        time: '9:00PM',
        date: new Date('5/12/2022'),
        location: {
            lat: 28.59267434926866,
            lng: -81.20291310732539,
        },
        contactPhone: '111-222-3335',
        contactEmail: 'notareal3@email.com',
        visibility: RSO,
        published: true,
        rsoName: 'Knight Hacks',
        uniName: 'University of Tentral Torida',
    };

    const dummyEvent4 = {
        eid: 'eid4',
        unid: 'fd8fc3d3-824a-476b-9207-be5483ec1459',
        rsoid: '413d0363-c62b-4da0-bbc0-0303c319521d',
        uid: 'c2d22b9f-d07b-4399-ac31-221cd264de49',
        name: 'Unpublished Public KnightHacks Event',
        description: 'Unpublished event description.',
        category: 'Casual',
        time: '10:00PM',
        date: new Date('5/16/2022'),
        location: {
            lat: 28.59267434926866,
            lng: -81.20291310732539,
        },
        contactPhone: '111-222-3336',
        contactEmail: 'notareal4@email.com',
        visibility: PUBLIC,
        published: false,
        rsoName: 'Knight Hacks',
        uniName: 'University of Tentral Torida',
    };

    const dummyEventList = [];
    dummyEventList.push(dummyEvent1);
    dummyEventList.push(dummyEvent2);
    dummyEventList.push(dummyEvent3);
    dummyEventList.push(dummyEvent4);

    const dateValid = () => !date || date.toString() === 'Invalid Date';

    const refreshEvents = () => {
        // Populate allEvents
        // TODO once endpoint is created
        // TODO: add rso name property to all events with a valid rsoid
        // TODO: if date is valid, discard any events before date
        // TODO: attach rsoName to each event
        console.log('TODO');
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
            console.log(`http://localhost:1433/rsos/?uid=${userData.uid}`);
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
                                        checked={publicOnly}
                                        onChange={(e, newValue) => {
                                            setPublicOnly(newValue);
                                            setMyUniOnly(false);
                                            setJoinedRSOsOnly(false);
                                        }}
                                    />
                                }
                                label="Public Events Only"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={myUniOnly}
                                        onChange={(e, newValue) => {
                                            setPublicOnly(false);
                                            setMyUniOnly(newValue);
                                            setJoinedRSOsOnly(false);
                                        }}
                                    />
                                }
                                label="My University Only"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={joinedRSOsOnly}
                                        onChange={(e, newValue) => {
                                            setPublicOnly(false);
                                            setMyUniOnly(false);
                                            setJoinedRSOsOnly(newValue);
                                        }}
                                    />
                                }
                                label="Joined RSOs Only"
                            />
                        </FormGroup>
                    ) : null}
                </Stack>
            </form>
            <Grid container spacing={2}>
                {dummyEventList.map((cardEvent) => {
                    if (userData) {
                        if (!cardEvent.published) return null;
                        if (publicOnly && cardEvent.visibility !== PUBLIC)
                            return null;
                        if (myUniOnly && cardEvent.unid !== userData.unid)
                            return null;
                        if (joinedRSOsOnly) {
                            let isJoined = false;
                            for (let rso of joinedRSOList)
                                if (rso.rsoid === cardEvent.rsoid)
                                    isJoined = true;
                            if (!isJoined) return null;
                        }
                        if (date && cardEvent.date < date) return null;
                    } else {
                        if (cardEvent.visibility !== PUBLIC) return null;
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
                refreshSearch={refreshEvents}
                userData={userData}
            />
        </Box>
    );
};

export default Home;
