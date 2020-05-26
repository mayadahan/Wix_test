import React, { useState } from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
import { SSL_OP_NO_TICKET } from 'constants';
import { render } from 'react-dom';

export type AppState = {
	tickets?: Ticket[],
	search: string,
	hiddenTickets: number,
	lable?: string,
	page: number,
	results?: Ticket[],
	showPopup: boolean,
	ticketNumber: number;
	}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		hiddenTickets: 0,
		page: 1,
		showPopup: false,
		ticketNumber: -1
		}	
	
	searchDebounce: any = null;


	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets(),
			results: await api.searchResults(''),
			showPopup: false
		});

		 }

	
	renderTickets = (tickets: Ticket[]) => {

	    const filteredTickets = tickets;
	    
		return (<ul className='tickets'>
			{(filteredTickets).map((ticket, i) => (<li key={ticket.id} className='ticket'>
				<button className="hide" value="hide" onClick={() => this.hide(i)}>Hide</button>
				<h5 className='title'>{ticket.title}</h5>
				{ticket.seeMore ? <p className='seeLess'>{ticket.content}</p> : <p className='content'>{ticket.content}</p>}
					<button className="seeMoreButton" onClick={()=> this.expand(i)}>{ticket.seeMore ? "See more" : "See less"}</button>
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
					{ticket.priority === "normal" ? <button className="setPriority" onClick={() => this.togglePopup(i)}>Set Priority</button> :
					 ticket.priority === "high" ? <button className="setPriority" onClick={() => this.togglePopup(i)} style={{backgroundColor:"#f14e4e"}}>High</button> :
					 <button className="setPriority" onClick={() => this.togglePopup(i)} style={{backgroundColor:"#84f14e"}}>Low</button>}
					<div className='lables'>{ticket.labels ? ticket.labels.map((label,i) => <span className="label">{label}</span>) : null}</div>
				</footer>
			</li>))}
		</ul>);
	}

	expand = (i:number) => {
		const tickets = this.state.tickets ? this.state.tickets  : null;
		
		if(tickets){
			tickets[i].seeMore = !(tickets[i].seeMore);
			this.setState({
				tickets: [...tickets]
			})
		}
			
	}

	hide = (i:number) => {
		const filteredTicketsHide = this.state.tickets ? this.state.tickets : null;
		if(filteredTicketsHide){
			filteredTicketsHide.splice(i, 1);
		this.setState({
			tickets: [...filteredTicketsHide],
			hiddenTickets: this.state.hiddenTickets + 1
		})
	
	  }
	}

	onSearch = async (val: string, newPage?: number) => {
		clearTimeout(this.searchDebounce);
		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val,
				page: newPage || 1,
				tickets : await api.searchTickets(val, newPage || 1),
				results : await api.searchResults(val)
			});
		}, 300);
	}

	//Restore all hidden tickets
	restore = () => {
		this.onSearch(this.state.search)

		this.setState({
			hiddenTickets: 0
		});
	}
	Pagination = (pageSize: number , ticketsNumber: number) => {
		const pageNumbers = [];

	for (let i = 1; i <= Math.ceil(ticketsNumber/pageSize); i++) {
		pageNumbers.push(i);
	}
	
	return (
		<nav>
		<ul className='pagination'>
			{pageNumbers.map(number => (
				<li key={number} className='page-item'>
					<a onClick={() => this.onSearch(this.state.search, number)} href='!#' className='page-link'>
						{number}
					</a>
				</li>    
				)
			)}
		</ul>
		</nav>
	
	);
	};
		
	togglePopup = (i: number) => {
		this.setState({  
			showPopup: !this.state.showPopup
	   }); 
	   if(i >= 0){
			this.setState({
				ticketNumber: i
			})
		}}
	

	changeSelect = async (value: string) => {


		const i = this.state.ticketNumber;
		if(i >= 0){
		const tickets = this.state.tickets ? this.state.tickets  : null;
		if(tickets){
			tickets[i].priority = value;
			this.setState({
				tickets: await api.setPriority(tickets[i].id, value, this.state.search, this.state.page),
			});
		}
		}

		this.togglePopup(-1);
		this.onSearch(this.state.search, this.state.page);
	}

	showPopup = () => {
		return (
		<div className='popup'>
		<div className='popup_inner'>
		{<button className="close" onClick={() => this.togglePopup(-1)}>X</button>}
		{<h1 className="set_priority">Set Priority</h1>}
		 <div className="vertical-align">
		{<label id="first"><button className="priority" id="High" onClick={() => this.changeSelect("high")}>High</button></label>}
		{<label><button className="priority" id="normal" onClick={() => this.changeSelect("normal")}>Normal</button></label>}
		{<label><button className="priority" id="Low" onClick={() => this.changeSelect("low")}>Low</button></label>}
		</div>
		</div>
		</div> 
		);
	}


	render() {	
		const {tickets,hiddenTickets,results, showPopup} = this.state;
		let restore = (hiddenTickets > 0 ? (<span className='hiddenMsg'><i>(<span >{hiddenTickets} hidden ticket{hiddenTickets > 1 ? 's' : ''} - </span> 
						<span className='restore' onClick={this.restore}> restore</span>
					)</i></span>) :null)
		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{showPopup? this.showPopup() : null}
			{tickets? (<div className='results'>Showing {tickets.length} results {restore}</div>) : null }	
			{tickets? this.renderTickets(tickets) : <h2>Loading..</h2>}
			{results? this.Pagination(20, results.length) : null}
		</main>)
	}
}

export default App;