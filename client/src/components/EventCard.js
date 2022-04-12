import axios from 'axios';
import {
    Box,
    Typography,
    CardContent,
    CardActions,
    Button,
    Card,
} from '@mui/material';
import { handleError } from '..';
import { format } from 'fecha';

const formatDate = (dateTime) => {
    return dateTime.toISOString().slice(0, 19).replace('T', ' ');
};

//const CREATE = 1;
const EDIT = 2;
const VIEW = 3;
//const CLOSED = 4;

const dtDisplayFormat = 'YYYY-MM-DD @ HH:mm:ss';

const EventCard = (props) => {
    const {
        event,
        setEvent,
        refreshEvents,
        setModalOp,
        setModalOpen,
        userData,
        setSnackbar,
        approving = false,
    } = props;

    const {
        eid,
        uniName = '',
        unid = null,
        rsoid = null,
        rsoName = '',
        uid = '',
        name = '',
        category = '',
        datetime = new Date(),
        location = '',
    } = event;

    const expired = new Date() > datetime;
    const owned = userData ? userData.uid === uid : false;

    const deleteEvent = () => {
        axios
            .delete(`http://localhost:1433/events`, { data: { eid } })
            .then((res) => {
                setSnackbar(true, 'success', 'Successfully deleted event!');
                refreshEvents();
            })
            .catch((err) => {
                handleError(err);
            });
    };

    const approveEvent = () => {
        const updatedEvent = {
            eid: event.eid,
            uid: event.uid,
            unid: event.unid,
            rsoid: event.rsoid,
            name: event.name,
            description: event.description,
            category: event.category,
            datetime: formatDate(event.datetime),
            location: event.location,
            lat: event.lat,
            lng: event.lng,
            contactPhone: event.contactPhone,
            contactEmail: event.contactEmail,
            published: true,
            approved: true,
        };

        axios
            .post(`http://localhost:1433/events/`, updatedEvent)
            .then((res) => {
                setSnackbar(true, 'success', 'Successfully approved event!');
                refreshEvents();
            })
            .catch((err) => {
                handleError(err);
            });
    };

    return (
        <Card
            sx={{
                width: 400,
                height: 265,
                outline: expired
                    ? '2px solid grey'
                    : owned
                    ? '2px solid green'
                    : '0px',
            }}
        >
            <CardContent sx={{ pb: 0 }}>
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        mb: 2,
                    }}
                    noWrap
                >
                    {name}
                </Typography>
                {rsoid !== null ? (
                    <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                        Hosted By: {rsoName}
                    </Typography>
                ) : unid !== null ? (
                    <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                        Hosted By: {uniName}
                    </Typography>
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                        Public Event
                    </Typography>
                )}

                <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                    {format(event.datetime, dtDisplayFormat)}
                </Typography>
                <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                    Location: {location}
                </Typography>
                <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                    Category: {category}
                </Typography>
            </CardContent>
            <CardActions>
                <Box
                    sx={{
                        textAlign: 'center',
                        width: '100%',
                        mt: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            mx: 1,
                        }}
                        onClick={() => {
                            setEvent(event);
                            setModalOp(VIEW);
                            setModalOpen(true);
                        }}
                    >
                        View
                    </Button>
                    {!approving && owned ? (
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{
                                mx: 1,
                                color: 'purple',
                            }}
                            onClick={() => {
                                setEvent(event);
                                setModalOp(EDIT);
                                setModalOpen(true);
                            }}
                        >
                            Edit
                        </Button>
                    ) : null}
                    {!approving && owned ? (
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{
                                mx: 1,
                                color: 'red',
                            }}
                            onClick={deleteEvent}
                        >
                            Delete
                        </Button>
                    ) : null}
                    {approving ? (
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{
                                mx: 1,
                                color: 'orange',
                            }}
                            onClick={approveEvent}
                        >
                            Approve
                        </Button>
                    ) : null}
                </Box>
            </CardActions>
        </Card>
    );
};

export default EventCard;
