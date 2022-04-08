import {
    Card,
    CardActions,
    CardContent,
    Button,
    Typography,
    Box,
    Autocomplete,
    Checkbox,
    TextField,
    FormControlLabel,
    Grid,
    FormGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CREATE = 1;
const EDIT = 2;
const VIEW = 3;
const CLOSED = 4;

const RSOSearch = (props) => {
    const { userData, setUserData } = props;

    const [allRSOs, setAllRSOs] = useState([]);
    const [allUniversities, setAllUniversities] = useState([]);

    const [rso, setRSO] = useState(null);
    const [university, setUniversity] = useState(null);

    const [showJoined, setShowJoined] = useState(false);
    const [showOwned, setShowOwned] = useState(false);

    const [modalOp, setModalOp] = useState(CLOSED);

    useEffect(() => {
        // Get list of all universities
        axios
            .get('http://localhost:1433/universities/')
            .then((resp) => {
                if (resp.status === 200) {
                    setAllUniversities(
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
    }, [userData]);

    const handleSearch = async () => {
        if (!university) return;

        try {
            const joinedList = [];

            // Get RSOs specific to that user
            let resp = await axios.get(
                `http://localhost:1433/rsos/?uid=${userData.uid}`
            );

            if (resp.status === 200) {
                for (let rso of resp.data.rsos) joinedList.push(rso.rsoid);
                console.log('Successfully retrieved joined RSOs');
            } else {
                console.error(
                    'GET all joined RSOs returned code ' + resp.status
                );
                console.log(resp.data);
            }

            // Get all RSOs at that university
            resp = await axios.get(
                `http://localhost:1433/rsos/?unid=${university.unid}`
            );

            if (resp.status === 200) {
                for (let rso of resp.data.rsos) {
                    for (let uni of allUniversities) {
                        if (uni.unid === rso.unid) {
                            rso.uname = uni.name;
                            break;
                        }
                    }

                    rso.joined = false;
                    for (let jid of joinedList) {
                        if (jid === rso.rsoid) {
                            rso.joined = true;
                            break;
                        }
                    }

                    rso.owned = rso.uid === userData.uid;
                }
                setAllRSOs(resp.data.rsos);
                console.log('Successfully retrieved RSOs');
            } else {
                console.error(
                    'GET all RSOs at requested university returned code ' +
                        resp.status
                );
                console.log(resp.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box sx={{ mt: 2, ml: 2 }}>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <Autocomplete
                        value={university}
                        disablePortal
                        options={allUniversities}
                        getOptionLabel={(univ) => univ.name}
                        onChange={(e, newValue) => {
                            setUniversity(newValue ?? null);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="University"
                                error={!university}
                            />
                        )}
                        isOptionEqualToValue={(univ1, univ2) => {
                            return (
                                univ1.name === univ2.name &&
                                univ1.unid === univ2.unid
                            );
                        }}
                        sx={{
                            width: 300,
                            display: 'inline-flex',
                            msFlexDirection: 'column',
                            WebkitFlexDirection: 'column',
                            flexDirection: 'column',
                            position: 'relative',
                        }}
                    />
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={handleSearch}
                        sx={{ ml: 2, height: 56 }}
                    >
                        Search
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            setModalOp(CREATE);
                            setRSO(props.rso);
                        }}
                        sx={{ ml: 2, height: 56 }}
                    >
                        Create New RSO
                    </Button>
                </div>
                <FormGroup sx={{ display: 'inline' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showJoined}
                                onChange={(e, newValue) =>
                                    setShowJoined(newValue)
                                }
                            />
                        }
                        label="Show Only Joined"
                    />
                    {userData && userData.permLevel > 1 ? (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showOwned}
                                    onChange={(e, newValue) =>
                                        setShowOwned(newValue)
                                    }
                                />
                            }
                            label="Show Only Owned"
                        />
                    ) : null}
                </FormGroup>
            </form>
            <Grid container spacing={2}>
                {allRSOs.map((rso) => {
                    if (showOwned && !rso.owned) return null;
                    if (showJoined && !rso.joined) return null;
                    return (
                        <Grid
                            key={rso.rsoid}
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            xl={3}
                            sx={{ my: 2 }}
                        >
                            <RSOCard
                                rso={rso}
                                userData={userData}
                                setModalOp={setModalOp}
                                setRSO={setRSO}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>

        // TODO: Start working on RSOmodal based on input operation and RSO data
        // TODO: Add modal to bottom of render tree
    );
};

const RSOCard = (props) => {
    const { rsoid, unid, uname, name, description, numMembers, joined, owned } =
        props.rso;

    const { setModalOp, setRSO, userData } = props;

    const joinRSO = () => {
        axios
            .post('http://localhost:1433/rsos/membership', {
                rsoid,
                uid: userData.uid,
            })
            .then((resp) => {
                if (resp.status === 200) {
                    console.log('Successfully joined RSO');
                    props.rso.joined = true;
                    // Force refresh
                    setRSO(props.rso);
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
                rsoid,
                uid: userData.uid,
            })
            .then((resp) => {
                if (resp.status === 200) {
                    console.log('Successfully joined RSO');
                    props.rso.joined = false;
                    // Force refresh
                    setRSO(props.rso);
                } else {
                    console.error(
                        'DELETE leave RSO returned status ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => {
                // TODO: Why is this returning 406?
                console.error(err);
                console.log(err.response.data);
            });
        /*
        Route: DELETE “/rsos/membership”
        In (body/json):
        {
            “rsoid”: <string>,
            “uid”: <string>
        }
        Out (json):
        In case of error (response 500, 406):
        {
            “error”: <String, error message explaining what went wrong>
        }
        No error:
        {
            “message”: “Relationship Deleted Successfully”
        }
        */
    };

    return (
        <Card
            sx={{
                width: 400,
                height: 200,
                outline: owned
                    ? '2px solid orange'
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
                                color: 'red',
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
                                setModalOp(EDIT);
                                setRSO(props.rso);
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
                            setModalOp(VIEW);
                            setRSO(props.rso);
                        }}
                    >
                        View
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
};

export default RSOSearch;
