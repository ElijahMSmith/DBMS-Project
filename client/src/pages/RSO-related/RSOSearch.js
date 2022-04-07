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

const RSOSearch = (props) => {
    const { userData, setUserData } = props;

    const [allRSOs, setAllRSOs] = useState([]);
    const [myRSOs, setMyRSOs] = useState([]);
    const [allUniversities, setAllUniversities] = useState([]);

    const [rso, setRSO] = useState(null);
    const [university, setUniversity] = useState(null);

    const [showJoined, setShowJoined] = useState(false);
    const [showOwned, setShowOwned] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalOp, setModalOp] = useState(VIEW);

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
                console.log(resp.data.rsos);
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

    const createRSO = () => {
        // TODO - open modal in CREATE mode
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
                        onClick={createRSO}
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
                    {userData.permLevel <= 1 ? (
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
            <Grid container spacing={2} sx={{ mt: 2 }}>
                {allRSOs.map((rso) => {
                    if (showOwned && !rso.owned) return null;
                    if (showJoined && !rso.joined) return null;
                    return (
                        <Grid key={rso.rsoid} item md={3}>
                            <RSOCard rso={rso} />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>

        // TODO: insert an RSO directly for newuser so I can test ownership
        // TODO: Add card outline for owned RSOs
        // TODO: Fix grid of cards
        // TODO: Fix buttons on bottom of card to only give appropriate options
        // TODO: Make the buttons work
    );
};

const RSOCard = (props) => {
    // const dummyRSO = {
    //     rsoid: 'rsoid-asdfasdfasdfasdfasdfaads',
    //     uid: 'uid-hansdklhfadlsnjflasndklads',
    //     unid: 'unid-asdfaergsklgjldfjladjllad',
    //     name: 'Knight Hacks',
    //     description:
    //         "This is a really long description about Knight Hacks. It's a really fun club that everyone should join, and it quite frankly rocks! I'm currently the vice president, but that might be changing shortly. For now I'm going to maximize the number of characters in this long paragraph and get to 300-ish.",
    //     numMembers: 300,
    // };

    const { unid, uname, name, description, numMembers, joined, owned } =
        props.rso;

    return (
        <Card sx={{ width: 400, height: 200 }}>
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
                <Typography sx={{ textAlign: 'center' }}>
                    {numMembers} Members
                </Typography>
            </CardContent>
            <CardActions>
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Button size="small">Join</Button>
                    <Button size="small">View</Button>
                </Box>
            </CardActions>
        </Card>
    );
};

export default RSOSearch;
