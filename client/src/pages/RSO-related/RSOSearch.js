import {
    Card,
    CardActions,
    CardContent,
    Button,
    Typography,
    Divider,
    Box,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const RSOSearch = (props) => {
    const { userData, setUserData } = props;

    const [allRSOs, setAllRSOs] = useState([]);
    const [allUniversities, setAllUniversities] = useState([]);
    const [searchVal, setSearchVal] = useState('');
    const [viewingRSO, setViewingRSO] = useState(null);

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
                } else {
                    console.error(
                        'GET all universities returned code ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => console.error(err));

        // TODO: get list of all RSOs
        axios
            .get('http://localhost:1433/rsos/')
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
                } else {
                    console.error(
                        'GET all universities returned code ' + resp.status
                    );
                    console.log(resp.data);
                }
            })
            .catch((err) => console.error(err));
    }, [userData]);

    const handleSearch = () => {
        // TODO: Request all events at the university matching searchVal
    };

    // TODO: render each card
    return <RSOCard />;
};

const RSOCard = (props) => {
    const dummyRSO = {
        rsoid: 'rsoid-asdfasdfasdfasdfasdfaads',
        uid: 'uid-hansdklhfadlsnjflasndklads',
        unid: 'unid-asdfaergsklgjldfjladjllad',
        name: 'Knight Hacks',
        description:
            "This is a really long description about Knight Hacks. It's a really fun club that everyone should join, and it quite frankly rocks! I'm currently the vice president, but that might be changing shortly. For now I'm going to maximize the number of characters in this long paragraph and get to 300-ish.",
        numMembers: 300,
    };

    const { rsoid, uid, unid, name, description, numMembers } = dummyRSO;
    //const { rsoid, uid, unid, name, description, numMembers } = props.rso;

    return (
        <Card sx={{ width: 400, height: 170 }}>
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
                <Typography sx={{ textAlign: 'center' }}>
                    University: {unid}
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    Members: {numMembers}
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
