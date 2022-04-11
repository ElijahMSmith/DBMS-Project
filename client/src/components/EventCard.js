import axios from 'axios';
import {
    Box,
    Typography,
    CardContent,
    CardActions,
    Button,
    Card,
    ButtonBase,
} from '@mui/material';

//const CREATE = 1;
const EDIT = 2;
const VIEW = 3;
//const CLOSED = 4;

function getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
}

const EventCard = (props) => {
    const {
        event,
        setEvent,
        refreshEvents,
        setModalOp,
        setModalOpen,
        userData,
    } = props;

    const {
        eid,
        unid,
        uniName,
        rsoid,
        rsoName,
        uid,
        name,
        description,
        category,
        time,
        date,
        location,
        contactPhone,
        contactEmail,
        visibility,
        published,
    } = event;

    const expired = new Date() > new Date(date);
    const owned = userData ? userData.uid === uid : false;

    const deleteEvent = () => {
        //TODO

        refreshEvents();
    };

    return (
        <Card
            sx={{
                width: 400,
                height: 220,
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
                    }}
                    noWrap
                >
                    {name}
                </Typography>

                <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                    Hosted By: {rsoid === '' ? uniName : rsoName}
                </Typography>

                <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                    {getFormattedDate(date)}
                </Typography>

                <Typography sx={{ textAlign: 'center', mt: 1 }} noWrap>
                    {time}
                </Typography>
            </CardContent>
            <CardActions>
                <Box sx={{ textAlign: 'center', width: '100%' }}>
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
                    {owned ? (
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
                    {owned ? (
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
                </Box>
            </CardActions>
        </Card>
    );
};

export default EventCard;
