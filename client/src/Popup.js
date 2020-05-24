import React from 'react';  
import './App.scss';  
import App from './App';
import {Ticket} from './api';
import data from 'server/data.json';
import fs from 'fs';
class Popup extends React.Component {  
    constructor(props){
        super(props);
            this.state = {
                id: null,
                title: null,
                content: null,
                email: null,
                date: null

            }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        }
    handleChange(event) {
        const target = event.target;
        const value = target.name === 'date' ? new Date(target.value).getTime() : target.value;
        const name = target.name;
        this.setState({[name]: value});
   }
   handleSubmit(event) {
        let newTicket =  {
        "id": this.state.id,
        "title": this.state.title,
        "content": this.state.content,
        "userEmail": this.state.email,
		"creationTime": this.state.date
		//"labels": ["Corvid", "Api"] 
        }
    let tempData = require('server/data.json');
    tempData.unshift(newTicket);
    let temp = JSON.stringify(temp);
    fs.writeFileSync('serve/data.json', temp, null, 2);
        
     }
   
    
  render() {  
return (  
<div className='popup' id="form">  
<div className='popup_inner'> 
<button className="close" onClick={this.props.closePopup}>X</button>
<h1>{this.props.text}</h1>  

<form>
ID: <input type="text" name="id" value={this.state.id}/><br/>
Title: <input type="text" name="title" value={this.state.title} onChange={this.idChange}/><br/>
Content: <input type="text" name="content" value={this.state.content} onChange={this.handleChange}/><br/>
User Email: <input type="email" name="email" value={this.state.email} onChange={this.handleChange}/><br/>
Creation date: <input type="date" name="date" value={this.state.date} onChange={this.handleChange}/><br/>
<button type="submit" value="Submit" onSubmit={this.handleSubmit}/>
</form>  
</div>  
</div>  
);  
}  
}  

export default Popup;