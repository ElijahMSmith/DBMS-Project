/* eslint-disable jsx-a11y/img-redundant-alt */
import {
    Box,
    Button,
    Grid,
    Modal,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ObjListAutocomplete from '../../components/ObjListAutocomplete';
import { handleError } from '../..';

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

const RSOmodal = (props) => {
    const {
        mode,
        rso,
        open,
        setModalOpen,
        allUniversities,
        setSnackbar,
        refreshSearch,
        userData,
        setUserData,
    } = props;

    // Fixed fields, not editable by user
    // Generated by server if empty
    const rsoid = rso ? rso.rsoid : '';
    const uid = rso ? rso.uid : '';

    // Editable by user, if that is the mode.
    const [name, setName] = useState(rso ? rso.name : '');
    const [description, setDescription] = useState(rso ? rso.description : '');
    const [numMembers, setNumMembers] = useState(rso ? rso.numMembers : 0);

    // If creating, will have to select a university.
    // Not changeable in edit mode.
    const [university, setUniversity] = useState(null);
    const [memberEmails, setMemberEmails] = useState('');

    // Not changeable, retrieved by the server
    const [owner, setOwner] = useState(null);
    const [photoUrl, setPhotoUrl] = useState('');

    const upgradePerms = () => {
        const newUserData = {
            uid: userData.uid,
            email: userData.email,
            username: userData.username,
            unid: university.unid,
            permLevel: 2,
        };
        axios
            .post('http://localhost:1433/auth/update', newUserData)
            .then((resp) => {
                setUserData(newUserData);
                console.log('Upgraded perms to admin');
            })
            .catch((err) => handleError(err));
    };

    const buildNewRSO = () => {
        if (
            !university ||
            name === '' ||
            description === '' ||
            (mode === CREATE && memberEmails === '')
        )
            return;

        const newRSO = {
            rsoid: rsoid.replace(/'/g, "''"),
            uid: uid.replace(/'/g, "''"),
            unid: university.unid.replace(/'/g, "''"),
            name: name.replace(/'/g, "''"),
            description: description.replace(/'/g, "''"),
            numMembers,
        };

        console.log(newRSO);

        if (mode === EDIT) {
            axios
                .post('http://localhost:1433/rsos/', newRSO)
                .then((resp) => {
                    setSnackbar(true, 'success', 'Successfully updated RSO');
                })
                .catch((err) => handleError(err));
        } else if (mode === CREATE) {
            // Parse member emails into a list
            const emailList = memberEmails.split('\n');

            // Must be at least 4 other members to create
            if (emailList.length < 4) {
                setSnackbar(
                    true,
                    'error',
                    'At least four other members are required for a new RSO!'
                );
                return;
            }

            // Test that all emails are from the same domain
            console.log(userData);
            const domain = userData.email.split('@')[1];
            for (let em of emailList) {
                console.log(domain + ' vs ' + em.split('@')[1]);
                if (domain !== em.split('@')[1]) {
                    setSnackbar(
                        true,
                        'error',
                        'All member emails must be from the same school domain!'
                    );
                    return;
                }
            }

            // Verify there are user accounts with this email
            axios
                .get(
                    `http://localhost:1433/auth/find/?emailList=${JSON.stringify(
                        emailList
                    )}`
                )
                .then((res) => {
                    const uidUserList = res.data.users;

                    if (uidUserList.length !== emailList.length) {
                        setSnackbar(
                            true,
                            'error',
                            'One or more emails were not attached to a registered user!'
                        );
                        return;
                    }

                    // Post the new RSO with 0 numMembers
                    axios
                        .post('http://localhost:1433/rsos/', {
                            uid: userData.uid,
                            unid: university.unid,
                            name,
                            description,
                            numMembers: 0,
                        })
                        .then((res) => {
                            const newid = res.data.rsoid;

                            const uidList = [userData.uid];
                            for (let iuser of uidUserList) uidList.push(iuser);

                            axios
                                .post('http://localhost:1433/rsos/membership', {
                                    uidList,
                                    rsoid: newid,
                                })
                                .then((res) => {
                                    setModalOpen(false);
                                    setSnackbar(
                                        true,
                                        'success',
                                        'RSO successfully created!'
                                    );
                                    upgradePerms();
                                    refreshSearch();
                                })
                                .catch((err) => {
                                    handleError(err);
                                });
                        })
                        .catch((error) => {
                            if (error.response && error.response.data)
                                setSnackbar(true, 'error', error.response.data);
                            else handleError(error);
                        });
                });
        }
        // Not applicable for viewing

        refreshSearch();
    };

    const getOwner = () => {
        if (uid === '') return;
        axios
            .get(`http://localhost:1433/auth/find/?uid=${uid}`)
            .then((res) => {
                setOwner(res.data);
            })
            .catch((err) => handleError(err));
    };

    const getFirstPicture = () => {
        if (!university) return;
        axios
            .get(`http://localhost:1433/universities/?unid=${university.unid}`)
            .then((res) => {
                const photos = res.data.photos;

                if (photos.length > 0) setPhotoUrl(photos[0]);
                else setPhotoUrl('');
            })
            .catch((err) => handleError(err));
    };

    useEffect(() => {
        setName(rso ? rso.name : '');
        setDescription(rso ? rso.description : '');
        setNumMembers(rso ? rso.numMembers : 0);
        setUniversity(rso ? { name: rso.uname, unid: rso.unid } : null);
        setMemberEmails('');
        if (!rso && userData) {
            for (let uni of allUniversities) {
                if (uni.unid === userData.unid)
                    setUniversity({ name: uni.name, unid: uni.unid });
            }
        }
        getOwner();
        getFirstPicture();
    }, [open]);

    return (
        <Modal open={open} onClose={() => setModalOpen(false)}>
            {mode === VIEW ? (
                <Box sx={style}>
                    <Typography
                        variant="h4"
                        sx={{ textAlign: 'center', mt: 3, mb: 5 }}
                    >
                        {name}
                    </Typography>
                    <Typography sx={{ my: 1, textAlign: 'center' }}>
                        <u>Description</u>: {description}
                    </Typography>
                    <Typography sx={{ my: 1, textAlign: 'center' }}>
                        <u>Location</u>: {rso ? rso.uname : ''}
                    </Typography>
                    <Typography sx={{ my: 1, textAlign: 'center' }}>
                        <u>Member Count</u>: {numMembers}
                    </Typography>
                    <Typography sx={{ my: 1, textAlign: 'center' }}>
                        <u>Owner</u>:{' '}
                        {owner
                            ? owner.username + ' (' + owner.email + ')'
                            : 'Loading...'}
                    </Typography>
                    <div
                        className="image-container"
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={photoUrl}
                            alt="Photo of matching university"
                            style={{
                                width: '80%',
                            }}
                        />
                    </div>
                </Box>
            ) : (
                <Box
                    sx={style}
                    component="form"
                    autoComplete="off"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Stack spacing={3}>
                        <Typography variant="h4" sx={{ textAlign: 'center' }}>
                            {mode === EDIT ? 'Edit' : 'Create New'} RSO
                        </Typography>

                        <TextField
                            required
                            label="RSO Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            inputProps={{ maxLength: 40 }}
                            sx={{ width: '100%' }}
                            helperText={`${name.length}/40`}
                            error={name.length === 0}
                        />

                        <TextField
                            required
                            label="RSO Description"
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            inputProps={{
                                maxLength: 300,
                            }}
                            sx={{ width: '100%' }}
                            helperText={`${description.length}/300`}
                            error={description.length === 0}
                        />

                        <ObjListAutocomplete
                            value={university}
                            allOptions={allUniversities}
                            setOption={setUniversity}
                            width="100%"
                            disabled
                        />

                        {mode === CREATE ? (
                            <TextField
                                required
                                label="Member Emails (One Per Line - 4 minimum required of the same email domain)"
                                variant="outlined"
                                value={memberEmails}
                                onChange={(e) =>
                                    setMemberEmails(e.target.value)
                                }
                                multiline
                                rows={3}
                                helperText="Each email must be a registered user on this system"
                                error={memberEmails.length === 0}
                            />
                        ) : null}

                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ width: '100%' }}
                        >
                            <Grid item xs={3}>
                                <Button
                                    type="submit"
                                    onClick={buildNewRSO}
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
            )}
        </Modal>
    );
};

export default RSOmodal;
