import { Autocomplete, TextField } from '@mui/material';

const options = [
    'Seminar',
    'Presentation',
    'Q&A',
    'Discussion',
    'Meet and Greet',
    'General Body Meeting',
    'Fundraising',
    'Volunteering',
    'Casual',
    'Reception',
    'Networking',
    'Athletic',
];

const CategoryAutocomplete = (props) => {
    const { value, setCategory, width = 300 } = props;

    return (
        <Autocomplete
            value={value}
            disablePortal
            options={options}
            onChange={(e, newValue) => setCategory(newValue ?? '')}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={'Category'}
                    error={!value || value === ''}
                />
            )}
            sx={{
                width: width,
                display: 'inline-flex',
                msFlexDirection: 'column',
                WebkitFlexDirection: 'column',
                flexDirection: 'column',
                position: 'relative',
            }}
        />
    );
};

export default CategoryAutocomplete;
