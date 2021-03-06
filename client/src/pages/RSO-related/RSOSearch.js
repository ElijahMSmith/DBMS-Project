import {
    Button,
    Box,
    Checkbox,
    FormControlLabel,
    Grid,
    FormGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ObjListAutocomplete from '../../components/ObjListAutocomplete';
import RSOmodal from './RSOmodal';
import RSOCard from '../../components/RSOCard';

const CREATE = 1;
//const EDIT = 2;
//const VIEW = 3;
const CLOSED = 4;

const RSOSearch = (props) => {
    const { userData, setUserData, setSnackbar } = props;

    const [allRSOs, setAllRSOs] = useState([]);
    const [allUniversities, setAllUniversities] = useState([]);

    const [rso, setRSO] = useState(null);
    const [university, setUniversity] = useState(null);

    const [showJoined, setShowJoined] = useState(false);
    const [showOwned, setShowOwned] = useState(false);

    const [modalOp, setModalOp] = useState(CLOSED);
    const [modalOpen, setModalOpen] = useState(false);
    const [forceUpdate, toggleForceUpdate] = useState(false);

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

            let resp;
            if (userData) {
                // Get RSOs specific to that user
                resp = await axios.get(
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

                    if (userData) rso.owned = rso.uid === userData.uid;

                    console.log(rso);
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
                    <ObjListAutocomplete
                        value={university}
                        allOptions={allUniversities}
                        setOption={setUniversity}
                    />
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={handleSearch}
                        sx={{ ml: 2, height: 56 }}
                    >
                        Search
                    </Button>
                    {userData ? (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setRSO(null);
                                setModalOp(CREATE);
                                setModalOpen(true);
                            }}
                            sx={{ ml: 2, height: 56 }}
                        >
                            Create New RSO
                        </Button>
                    ) : null}
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
                                setModalOpen={setModalOpen}
                                setRSO={setRSO}
                                toggleForceUpdate={toggleForceUpdate}
                                forceUpdate={forceUpdate}
                                refreshRSOs={handleSearch}
                            />
                        </Grid>
                    );
                })}
            </Grid>
            <RSOmodal
                open={modalOpen}
                mode={modalOp}
                setModalOpen={setModalOpen}
                rso={rso}
                allUniversities={allUniversities}
                setSnackbar={setSnackbar}
                refreshSearch={handleSearch}
                userData={userData}
                setUserData={setUserData}
            />
        </Box>
    );
};

export default RSOSearch;
