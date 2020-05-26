import axios from 'axios';
import { SSL_OP_NO_TICKET } from 'constants';
export type Ticket = {
	id: string,
	title: string;
	content: string;
	creationTime: number;
	userEmail: string;
	labels?: string[];
	seeMore: boolean;
	priority?: string;
}
 


export type ApiClient = {

	searchTickets: (value: string, page: number) => Promise<Ticket[]>;
	searchResults: (value: string) => Promise<Ticket[]>;
	setPriority: (id: string, value: string, search: string, page: number) => Promise<Ticket[]>;
}

export const createApiClient = (): ApiClient => {
	return {

		//request the server for first 20 results of search
		searchTickets: (value: string, page: number) => {

			return axios.get(`http://localhost:3232/api/search?value=` + value + `&page=` + page).then((res) => res.data);
		},
		//request the server for all results for search
		searchResults: (value: string) => {

			return axios.get(`http://localhost:3232/api/searchResults?value=` + value).then((res) => res.data);
		},
		//sets the new priority in the relevant ticket and returns the first 20 results of search after change
		setPriority: (id: string, value: string, search: string, page: number) => {

			return axios.get(`http://localhost:3232/api/setPriority?id=` + id +`&value=` + value + `&search` + search + `&page`+ page).then((res) => res.data);
		}

	}
}



