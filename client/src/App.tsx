import React, { useState } from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
import { SSL_OP_NO_TICKET } from 'constants';

export type AppState = {
	tickets?: Ticket[],
	filtered?: Ticket[],
	search: string,
	hiddenTickets: number,
	restoreTickets: string
	lable?: string;
	}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		hiddenTickets: 0,
		restoreTickets: ''
	}	
	
	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
		if(this.state.tickets){
		this.setState({ 
			filtered: [...this.state.tickets].slice(0,20)}
		); }
	}
	
	renderTickets = (tickets: Ticket[]) => {
		const filteredTickets = this.searchFilter(tickets);

		return (<ul className='tickets'>
			{filteredTickets.map((ticket, i) => (<li key={ticket.id} className='ticket'>
				<button className="hide" value="hide" onClick={() => this.hide(i)}>Hide</button>
				<h5 className='title'>{ticket.title}</h5>
				<p className='content'>{ticket.content}</p>
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
					<div className='lables'>{ticket.labels ? ticket.labels.map((label,i) => <span className="label">{label}</span>) : null}</div>
				</footer>
			</li>))}
		</ul>);
	}

	hide = (i:number) => {
		const filteredTicketsHide = this.state.filtered ? this.searchFilter(this.state.filtered) : null;
		if(filteredTicketsHide){
			filteredTicketsHide.splice(i, 1);
		this.setState({
			filtered: filteredTicketsHide,
			hiddenTickets: this.state.hiddenTickets + 1
		})
	
	  }
	}

	searchFilter = (tickets: Ticket[]) => 
		tickets.filter((t) => 
			(t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));		

	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	//Restore all hidden tickets
	restore = () => {
		if(this.state.tickets) 
			this.setState({
				filtered : [...this.state.tickets],
				hiddenTickets : 0
			});
	}

	render() {	
		const {tickets,filtered,restoreTickets,hiddenTickets} = this.state;
		let restore = (hiddenTickets > 0 ? (<span className='hiddenMsg'><i>(<span >{hiddenTickets} hidden ticket{hiddenTickets > 1 ? 's' : ''} - </span> 
						<span className='restore' onClick={this.restore}> restore</span>
					)</i></span>) :null)
					
    	return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{tickets ? (<div className='results'>Showing {tickets.length - hiddenTickets} results {restore}</div>) : null }	
			{filtered? this.renderTickets(filtered) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;