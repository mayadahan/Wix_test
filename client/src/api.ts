import axios from 'axios';
import React from 'react';
import { SSL_OP_NO_TICKET } from 'constants';
export type Ticket = {
	id: string,
	title: string;
	content: string;
	creationTime: number;
	userEmail: string;
	labels?: string[];
	show: boolean;
}


export type ApiClient = {
	getTickets: () => Promise<Ticket[]>;
}

export const createApiClient = (): ApiClient => {
	return {
		getTickets: () => {
			return axios.get(`http://localhost:3232/api/tickets`).then((res) => res.data);
		}
	}
}



