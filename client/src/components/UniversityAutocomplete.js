import { Autocomplete, TextField } from '@mui/material';

const UniversityAutocomplete = (props) => {
    const { allUniversities, value, setUniversity } = props;

    return (
        <Autocomplete
            value={value}
            disablePortal
            options={allUniversities}
            getOptionLabel={(univ) => univ.name}
            onChange={(e, newValue) => {
                setUniversity(newValue ?? null);
            }}
            renderInput={(params) => (
                <TextField {...params} label="University" error={!value} />
            )}
            isOptionEqualToValue={(univ1, univ2) => {
                return univ1.name === univ2.name && univ1.unid === univ2.unid;
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
    );
};

export default UniversityAutocomplete;
