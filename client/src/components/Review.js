import { Box, TextField, Typography, Rating, Stack } from '@mui/material';
import { format } from 'fecha';

const dtDisplayFormat = 'YYYY-MM-DD @ HH:mm:ss';

const formatDate = (date) => {
    return format(date, dtDisplayFormat);
};

const Review = (props) => {
    const {
        reviewData = {},
        setReviewData,
        editing = false,
        width = '100%',
        showHeader = false,
    } = props;

    const { comment = {}, rating = {} } = reviewData;

    return (
        <Stack sx={{ width }}>
            <Box>
                {showHeader ? (
                    <Typography variant="p" sx={{ mr: 2 }}>
                        {(comment.username ?? '') +
                            ' - ' +
                            formatDate(comment.created ?? new Date())}
                    </Typography>
                ) : null}
                {rating !== -1 ? (
                    <Rating
                        value={rating.numStars ?? 0}
                        onChange={(event, newValue) => {
                            rating.numStars = newValue;
                            setReviewData({ comment, rating });
                        }}
                        precision={1}
                        readOnly={!editing}
                    />
                ) : null}
            </Box>

            <TextField
                value={comment.description ?? ''}
                label={editing ? 'Comment' : null}
                variant="outlined"
                onChange={(e) => {
                    comment.description = e.target.value;
                    setReviewData({ comment, rating });
                }}
                multiline
                rows={4}
                inputProps={{ maxLength: 300 }}
                sx={{ width: '100%', mt: 1 }}
                helperText={
                    editing
                        ? `${
                              comment.description
                                  ? comment.description.length
                                  : 0
                          }/300`
                        : null
                }
                disabled={!editing}
            />
        </Stack>
    );
};

export default Review;
