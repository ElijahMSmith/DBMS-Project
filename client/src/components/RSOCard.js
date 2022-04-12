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

//const CREATE = 1;
const EDIT = 2;
const VIEW = 3;
//const CLOSED = 4;

const RSOCard = (props) => {
    const { rsoid, unid, uname, name, description, numMembers, joined, owned } =
        props.rso;

    const {
        setModalOp,
        setModalOpen,
        setRSO,
        userData,
        refreshRSOs,
        forceUpdate,
    } = props;

    const joinRSO = () => {
        axios
            .post('http://localhost:1433/rsos/membership', {
                rsoid,
                uid: userData.uid,
            })
            .then((resp) => {
                if (resp.status === 200) {
                    console.log('Successfully joined RSO');
                    refreshRSOs(!forceUpdate);
                } else {
                    console.error(
                        'POST join RSO returned status ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const leaveRSO = () => {
        axios
            .delete('http://localhost:1433/rsos/membership', {
                data: {
                    rsoid,
                    uid: userData.uid,
                },
            })
            .then((resp) => {
                if (resp.status === 200) {
                    console.log('Successfully left RSO');
                    refreshRSOs(!forceUpdate);
                } else {
                    console.error(
                        'DELETE leave RSO returned status ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => {
                handleError(err);
            });
    };

    return (
        <Card
            sx={{
                width: 400,
                height: 200,
                outline: owned
                    ? '2px solid #000094'
                    : joined
                    ? '2px solid green'
                    : '0px',
            }}
        >
            <CardContent sx={{ pb: 0 }}>
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        mb: 1,
                    }}
                    noWrap
                >
                    {name}
                </Typography>
                <Typography
                    sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        textAlign: 'center',
                    }}
                    variant="body1"
                >
                    {description}
                </Typography>
                <Typography sx={{ textAlign: 'center', mt: 1 }}>
                    {numMembers} Members
                </Typography>
            </CardContent>
            <CardActions>
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    {joined ? (
                        <Button
                            size="small"
                            variant="outlined"
                            sx={{
                                color: 'orange',
                                mx: 1,
                            }}
                            onClick={leaveRSO}
                            disabled={owned}
                        >
                            Leave
                        </Button>
                    ) : null}
                    {!joined && userData && userData.unid === unid ? (
                        <Button
                            size="small"
                            variant="outlined"
                            sx={{
                                color: 'green',
                                mx: 1,
                            }}
                            onClick={joinRSO}
                        >
                            Join
                        </Button>
                    ) : null}
                    {owned ? (
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{
                                mx: 1,
                                color: 'purple',
                            }}
                            onClick={() => {
                                setRSO(props.rso);
                                setModalOp(EDIT);
                                setModalOpen(true);
                            }}
                        >
                            Edit
                        </Button>
                    ) : null}
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            mx: 1,
                        }}
                        onClick={() => {
                            setRSO(props.rso);
                            setModalOp(VIEW);
                            setModalOpen(true);
                        }}
                    >
                        View
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
};

export default RSOCard;
