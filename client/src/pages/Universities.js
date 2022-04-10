import "./App.css";
import axios from 'axios';
import {useState} from 'react'
import { useEffect } from 'react';
import { Link } from "react-router-dom";


const Universities = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchData, setUserData] = useState([])

    useEffect(() => {
        // Update the document title using the browser API
        axios.get('http://localhost:1433/universities').then((response)=>{
            setUserData(response.data.universities)
            console.log(response.data)
           
            
        });
        
                
      },[]);


    return (<div className="App">
        <input type="text" placeholder="Search..." onChange={event => {setSearchTerm(event.target.value)}} />
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
        </div>
            );
    
};

export default Universities;
