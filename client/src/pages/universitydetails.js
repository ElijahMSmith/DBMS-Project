import "./App.css";
import axios from 'axios';
import {useState} from 'react'
import { useEffect } from 'react';
import { Link, useSearchParams } from "react-router-dom";
import React, { Component } from 'react';
import ReactDOM from "react-dom";
var i = 0;


    
 

const Universitydetails = () => {
    
    const [searchTerm, setSearchTerm] = useState('')
    const [searchData, setUserData] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const [state, setState] = useState({});

    

    useEffect(() => {
        // Update the document title using the browser API
        console.log(`http://localhost:1433/universities/?unid=${searchParams.get('unid')}`)
        axios.get(`http://localhost:1433/universities/?unid=${searchParams.get('unid')}`).then((response)=>{
            setUserData(response.data)
            console.log(response.data)
            
           
            
        });
        
                
      },[]);
      console.log(searchData)
    return (<div className="App">
        
                 Name:{searchData?searchData.name:""}
                 
        <div>
            <br></br>
                Unid:{searchData?searchData.unid:""}{'\n'}
            </div>
                    <div>
                    <br></br>
                    Description:{searchData?searchData.description:""}{'\n'}
                    </div>
                            <div>
                            <br></br>
                                Number Of Students:{searchData?searchData.numStudents:""}{'\n'}
                            </div>
                            <div>
                            <br></br>
                            
                            
                            
                            {/* <img src= {searchData?searchData.photos[0]:""}/>
                            <img src= {searchData?searchData.photos[1]:""}/>
                            <img src= {searchData?searchData.photos[0]:""}/> */}
                         
                           
                            {searchData  ?(searchData.photos.map(name =>  <img src= {name} key = {name}/>)):null}
                            
                          

                            
                            

                            
                            
                            
                            
                             
                               
                              
                            
                           

                            
                            </div>
                           
            
            </div>
        
            );
           
            
    
};


 
export default Universitydetails;
