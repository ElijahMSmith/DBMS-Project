import { Autocomplete, TextField } from '@mui/material';

const ObjListAutocomplete = (props) => {
    const {
        allOptions,
        value,
        setOption,
        label = 'University',
        width = 300,
        disabled = false,
    } = props;

    return (
        <Autocomplete
            value={value}
            disabled={disabled}
            disablePortal
            options={allOptions}
            getOptionLabel={(option) => option.name}
            onChange={(e, newValue) => setOption(newValue ?? null)}
            renderInput={(params) => (
                <TextField {...params} label={label} error={!value} />
            )}
            isOptionEqualToValue={(op1, op2) => {
                return op1.name === op2.name && op1.unid === op2.unid;
            }}
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

export default ObjListAutocomplete;
