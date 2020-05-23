import React, { useState } from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
import { SSL_OP_NO_TICKET } from 'constants';
import { render } from 'react-dom';


export type AppState = {
	tickets?: Ticket[],
	AllTickets?: Ticket[],
	search: string,
	hiddenTickets: number,
	restoreTickets: string,
	lable?: string,
	page: number,
	results?: Ticket[];
	}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		hiddenTickets: 0,
		restoreTickets: '',
		page: 1
		}	
	
	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets(),
			results: await api.searchResults('')
		});
		if(this.state.tickets){
			for (let i = 0; i <this.state.tickets.length; i++){
				this.state.tickets[i].seeMore = true;
		}
		this.setState({
			tickets: [...this.state.tickets],
		});
		 }
	}
	
	renderTickets = (tickets: Ticket[]) => {

	    const filteredTickets = tickets;
	
		return (<ul className='tickets'>
			{(filteredTickets).map((ticket, i) => (<li key={ticket.id} className='ticket'>
				<button className="hide" value="hide" onClick={() => this.hide(i)}>Hide</button>
				<h5 className='title'>{ticket.title}</h5>
				{filteredTickets[i].seeMore ? <p className='seeLess'>{ticket.content}</p> : <p className='content'>{ticket.content}</p>}
					<button className="seeMoreButton" onClick={()=> this.expand(i)}>{filteredTickets[i].seeMore ? "See more" : "See less"}</button>
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
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
				tickets: tickets
			})}
			
	}

	hide = (i:number) => {
		const filteredTicketsHide = this.state.tickets ? this.state.tickets : null;
		if(filteredTicketsHide){
			filteredTicketsHide.splice(i, 1);
		this.setState({
			tickets: filteredTicketsHide,
			hiddenTickets: this.state.hiddenTickets + 1
		})
	
	  }
	}

	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val,
				tickets : await api.searchTickets(val, newPage || 1),
				results : await api.searchResults(val)
			});
			if(this.state.tickets){
				for (let i = 0; i <this.state.tickets.length; i++){
					this.state.tickets[i].seeMore = true;
				 }
			this.setState({
				tickets: [...this.state.tickets]
			});
			 }
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

	render() {	
		const {tickets,restoreTickets,hiddenTickets,results} = this.state;
		let restore = (hiddenTickets > 0 ? (<span className='hiddenMsg'><i>(<span >{hiddenTickets} hidden ticket{hiddenTickets > 1 ? 's' : ''} - </span> 
						<span className='restore' onClick={this.restore}> restore</span>
					)</i></span>) :null)
		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{tickets? (<div className='results'>Showing {tickets.length} results {restore}</div>) : null }	
			{tickets? this.renderTickets(tickets) : <h2>Loading..</h2>}
			{results ? this.Pagination(20, results.length) : null}
		</main>)
	}
}

export default App;