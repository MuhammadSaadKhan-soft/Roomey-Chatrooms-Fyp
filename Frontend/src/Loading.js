import React from 'react';
import ReactLoading from 'react-loading';
import '../src/Components/css/loading.css';
import chatting from "./Components/images/chattingfriends.png";

const Loading = () => (
    
    <div className="loading-container">
         
         <ReactLoading className='loading' type={'spin'} color={'#000'} height={50} width={50} />
        
       
        <img className='image' style={{width:'150px'}} src={chatting} alt="filled-chat--v1"/>
    </div>
);
setTimeout(()=>{
    Loading()
},[100])
export default Loading;
