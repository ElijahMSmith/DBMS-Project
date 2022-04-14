import {
    Button,
    Divider,
    List,
    Paper,
    Rating,
    Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import Review from '../../components/Review';

const VIEW = 3;
const COMMENTLIST = 4;

const CommentsPage = (props) => {
    const { reviewsList = [], avgRating = 0, setMode } = props;

    return (
        <Box
            style={{
                width: '100%',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mb: 3,
                }}
            >
                <Typography>
                    Average Rating:{' '}
                    <Rating value={avgRating} readOnly precision={0.1} />
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setMode(VIEW)}
                    sx={{ ml: 2, height: 30, width: 70 }}
                >
                    Back
                </Button>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box
                style={{
                    maxHeight: '800px',
                    overflow: 'auto',
                    width: '100%',
                }}
            >
                <List>
                    {reviewsList.length > 0 ? (
                        reviewsList.map((review) => {
                            return (
                                <Box key={review.comment.cid}>
                                    <Review
                                        reviewData={review}
                                        width="100%"
                                        showHeader
                                    />
                                    <Divider sx={{ my: 2 }} />
                                </Box>
                            );
                        })
                    ) : (
                        <Typography sx={{ textAlign: 'center' }}>
                            No submitted reviews yet. You could be the first!
                        </Typography>
                    )}
                </List>
            </Box>
        </Box>
    );
};

export default CommentsPage;
