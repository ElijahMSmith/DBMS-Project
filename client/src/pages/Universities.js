import './App.css';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    Link,
    Modal,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { handleError } from '..';

const NONE = 0;
const CREATE = 1;
const EDIT = 2;
const VIEW = 3;

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 750,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function isNumeric(str) {
    return (
        !isNaN(str) && // use type coercion to parse the entirety of the string (parseFloat alone does not do this)...
        !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
}

const Universities = (props) => {
    const { userData, setUserData, setSnackbar } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchData, setSearchData] = useState([]);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState(NONE);
    const [uniName, setUniName] = useState('');
    const [numStudents, setNumStudents] = useState('');
    const [description, setDescription] = useState('');
    const [unid, setUnid] = useState('');
    const [photoUrlText, setPhotoUrlText] = useState('');
    const [origPhotoUrls, setOrigPhotoUrls] = useState('');
    const [photos, setPhotos] = useState([]);

    const getUniversityDetails = (findUnid) => {
        axios
            .get(`http://localhost:1433/universities/?unid=${findUnid}`)
            .then((resp) => {
                const uni = resp.data;
                setUniName(uni.name);
                setDescription(uni.description);
                setNumStudents(uni.numStudents);
                setUnid(findUnid);
                setPhotos(uni.photos);
                setPhotoUrlText(uni.photos.join('\n'));
                setOrigPhotoUrls(uni.photos.join('\n'));
            })
            .catch((err) => handleError(err));
    };

    const submitData = () => {

        if (
            uniName === '' ||
            numStudents === '' ||
            description === '' ||
            !isNumeric(numStudents) ||
            photoUrlText === ''
        )
            return;

        const univ = {
            name: uniName,
            description: description,
            numStudents: parseInt(numStudents),
        };

        if (unid !== '') univ.unid = unid;

        axios
            .post('http://localhost:1433/universities', univ)
            .then(async (resp) => {
                setOpen(false);

                let allUrls = origPhotoUrls.trim().toLowerCase().split('\n');
                for (let url of allUrls)
                    await axios
                        .delete('http://localhost:1433/universities/photo', {
                            data: {
                                unid: resp.data.unid,
                                imageURL: url,
                            },
                        })
                        .catch((err) =>
                            console.log(
                                'Failed to delete image with url ' + url
                            )
                        );

                allUrls = photoUrlText.trim().toLowerCase().split('\n');
                for (let url of allUrls)
                    axios
                        .post('http://localhost:1433/universities/photo', {
                            unid: resp.data.unid,
                            imageURL: url,
                        })
                        .catch((err) =>
                            console.log('Failed to add image with url ' + url)
                        );

                setSnackbar(
                    true,
                    'success',
                    `University profile ${
                        mode === CREATE ? 'created' : 'updated'
                    }!`
                );
                setMode(NONE);
                setOpen(false);
            })
            .catch((err) => handleError(err));
    };

    const reloadUni = () => {
        axios.get('http://localhost:1433/universities').then((response) => {
            setSearchData(response.data.universities);
        });
    };

    useEffect(() => {
        // Update the document title using the browser API
        reloadUni();
    }, []);

    return (
        <div className="App">
            {mode === VIEW ? (
                <Stack
                    spacing={5}
                    sx={{
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={{ height: '20px' }} />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={() => setMode(NONE)}
                            sx={{ width: '200px' }}
                        >
                            {' '}
                            Back to Search
                        </Button>
                    </Box>

                    <p>Name: {uniName}</p>
                    <p>Unid: {unid}</p>
                    <p>Description: {description}</p>
                    <p>Students: {numStudents}</p>

                    {photos.map((name) => (
                        <img src={name} key={name} alt="" />
                    ))}
                </Stack>
            ) : (
                <>
                    <Box>
                        {' '}
                        <input
                            type="text"
                            placeholder="Search..."
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                            }}
                        />
                        {userData && userData.permLevel >= 3 ? (
                            <Button
                                sx={{
                                    marginLeft: 2,
                                    borderRadius: 2,
                                    outline: '1px solid',
                                }}
                                onClick={(e) => {
                                    setOpen(true);
                                    setMode(CREATE);
                                    setUniName('');
                                    setDescription('');
                                    setNumStudents(0);
                                    setPhotos([]);
                                    setPhotoUrlText('');
                                    setOrigPhotoUrls('');
                                    setUnid('');
                                }}
                            >
                                Create a new university
                            </Button>
                        ) : null}
                    </Box>
                    {searchData
                        .filter((val) => {
                            if (!searchTerm || searchTerm === '') {
                                return val;
                            } else if (
                                val.name
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                            ) {
                                return val;
                            }
                        })
                        .map((val, key) => {
                            return (
                                <div className="user" key={key}>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            my: 2,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Link
                                            onClick={() => {
                                                setMode(VIEW);
                                                getUniversityDetails(val.unid);
                                            }}
                                        >
                                            <p>{val.name}</p>
                                        </Link>
                                        {userData && userData.permLevel >= 3 ? (
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    marginLeft: 2,
                                                    borderRadius: 2,
                                                }}
                                                onClick={(e) => {
                                                    setOpen(true);
                                                    setMode(EDIT);
                                                    getUniversityDetails(
                                                        val.unid
                                                    );
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        ) : null}
                                    </Box>
                                </div>
                            );
                        })}
                </>
            )}

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={style} component="form" autoComplete="off">
                    <Stack spacing={3}>
                        <Typography
                            variant="h4"
                            sx={{ textAlign: 'center' }}
                        ></Typography>

                        <TextField
                            required
                            label="University Name"
                            variant="outlined"
                            value={uniName}
                            onChange={(e) => setUniName(e.target.value)}
                            inputProps={{ maxLength: 40 }}
                            sx={{ width: '100%' }}
                        />

                        <TextField
                            required
                            label="University Description"
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            inputProps={{
                                maxLength: 300,
                            }}
                            sx={{ width: '100%' }}
                        />

                        <TextField
                            required
                            label="Num Of Students"
                            variant="outlined"
                            value={numStudents}
                            onChange={(e) => {
                                setNumStudents(e.target.value);
                            }}
                            multiline
                            rows={3}
                            inputProps={{
                                maxLength: 9,
                            }}
                            sx={{ width: '100%' }}
                        />

                        <TextField
                            required
                            label="Photo Urls (1 minimum, each url on a separate line)"
                            variant="outlined"
                            value={photoUrlText}
                            onChange={(e) => setPhotoUrlText(e.target.value)}
                            multiline
                            rows={3}
                            sx={{ width: '100%' }}
                            error={photoUrlText === ''}
                        />

                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ width: '100%' }}
                        >
                            <Grid item xs={3}>
                                <Button
                                    onClick={submitData}
                                    sx={{
                                        borderRadius: 2,
                                        outline: '1px solid',
                                    }}
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
};

export default Universities;
