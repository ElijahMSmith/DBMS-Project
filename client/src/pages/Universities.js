import "./App.css";
import axios from 'axios';
import {useState} from 'react'
import { useEffect } from 'react';
import { Link } from "react-router-dom";
import {
    Box,
    Button,
    Grid,
    Modal,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
const CREATE = 1;
const EDIT = 2;
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
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the entirety of the string (parseFloat alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


const Universities = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchData, setUserData] = useState([])
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState(CREATE)
    const [uniName, setUniName] = useState('');
    const [numStudents, setNumStudents] = useState('');
    const [description, setDescription] = useState('');
    const submitData = () => {

        console.log({ uniName, numStudents, description });
        if (
            uniName === '' ||
            numStudents === '' ||
            description === '' ||
            !isNumeric(numStudents)
            
        )
            return;

        const newUniversity = {
            name: uniName,
            description: description,
            numStudents: parseInt(numStudents),
            
        };

        console.log('Mode: ' + mode);
        axios
        .post('http://localhost:1433/universities', newUniversity).then((resp) => {
            console.log("WOW BRO U DID IT") 
            setOpen(false)
            reloadUni()
        })
        .catch((err) => console.error(err));
        
       
       }

       const reloadUni = () => {

        axios.get('http://localhost:1433/universities').then((response)=>{
            setUserData(response.data.universities)
            console.log(response.data)
        });
        
       
       }

    useEffect(() => {
        // Update the document title using the browser API
        reloadUni()
        
                
      },[]);


    return (<div className="App">

       <Box> <input type="text" placeholder="Search..." onChange={event => {setSearchTerm(event.target.value)}} />
        <Button
                                    
                                    sx={{
                                        marginLeft: 2,
                                        borderRadius: 2,
                                        outline: '1px solid',
                                    }}
                                    onClick={(e) => {
                                        setOpen(true);
                                        setMode(CREATE);
                                    }}
                                >
                                    Create a new university
                                </Button>
                                </Box>
        {searchData.filter((val)=>{
            if(searchTerm==""){
                return val
            } else if (val.name.toLowerCase().includes(searchTerm.toLowerCase())){
                return val
            }
        }).map((val, key)=> {
            return( 
            <div className="user" key={key}>
                
                <p><a href={`http://localhost:3000/university/details/?unid=${val.unid}`}>{val.name}</a></p>
                
                
                
            </div>
            
        );
        })}
        
        {
            
            
            
            
            
            
            
            
            
            
            <Modal open={open} onClose={() => setOpen(false)}>
            {mode === CREATE?(
                <Box
                    sx={style}
                    component="form"
                    autoComplete="off"
                  
                >
                    <Stack spacing={3}>
                        <Typography variant="h4" sx={{ textAlign: 'center' }}>
                            
                        </Typography>

                        <TextField
                            required
                            label="University Name"
                            variant="outlined"
                            value={uniName}
                                onChange={(e) =>
                                    setUniName(e.target.value)
                                }
                            inputProps={{ maxLength: 40 }}
                            sx={{ width: '100%' }}
                        />

                        <TextField
                            required
                            label="University Description"
                            variant="outlined"
                            value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
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
                                onChange={(e) =>{
                                    
                                    setNumStudents(e.target.value);}
                                    
                                }
                            multiline
                            rows={3}
                            inputProps={{
                                maxLength: 9,
                            }}
                            sx={{ width: '100%' }}
                          
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
        
            ):(<p>todo</p>)}
        </Modal>}




        </div>

            );
        
    
};

export default Universities;
