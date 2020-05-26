import express from 'express';
import * as fs from 'fs';
import bodyParser = require('body-parser');
import {tempData} from './temp-data';
import {Ticket} from '@ans-exam/client/src/api';

const app = express();

const PORT = 3232;

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((_, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

app.get('/api/search', (req, res) => {

	const page = req.query.page || 1;
	const value = req.query.value || "";
	const filtered = req.query.filtered;
	let search_pages = [];
	const regex = /^(after:|before:|from:)((0[1-9]|[1-2][0-9]|3[0-1])[\/\-](0[1-9]|1[0-2])[\/\-](\d{4})|\w+[@]\w+[.]\w+)[ ]*([\w ]*)[ ]*$/ 
	const m = value.match(regex);
	if(m){
			
	search_pages = tempData.filter((t) => 

	(t.title.toLowerCase() + t.content.toLowerCase()).includes(m[6].toLowerCase())&&
	(m[1] === "after:" ? t.creationTime > new Date (m[5], m[4] - 1, m[3]).getTime() : m[1] ==="before:" ? t.creationTime < new Date (m[5], m[4] - 1, m[3]).getTime() : m[2] === t.userEmail))

	}
	
	 else{
		search_pages = tempData.filter((t) => 

		(t.title.toLowerCase() + t.content.toLowerCase()).includes(value.toLowerCase()))
		}

	const paginatedData = search_pages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	res.send(paginatedData);

});

app.get('/api/searchResults', (req, res) => {

	const value = req.query.value || "";
	let search_pages = [];
	const regex = /^(after:|before:|from:)((0[1-9]|[1-2][0-9]|3[0-1])[\/\-](0[1-9]|1[0-2])[\/\-](\d{4})|\w+[@]\w+[.]\w+)[ ]*([\w ]*)[ ]*$/ 
	const m = value.match(regex);
	if(m){
			
		search_pages = tempData.filter((t) => 

	(t.title.toLowerCase() + t.content.toLowerCase()).includes(m[6].toLowerCase())&&
	(m[1] === "after:" ? t.creationTime > new Date (m[5], m[4] - 1, m[3]).getTime() : m[1] === "before:" ? t.creationTime < new Date (m[5], m[4] - 1, m[3]).getTime() : m[2] === t.userEmail))

	}
	
	 else{
		search_pages = tempData.filter((t) => 

		(t.title.toLowerCase() + t.content.toLowerCase()).includes(value.toLowerCase()))
	
	}
		
	res.send(search_pages);
});

app.get('/api/setPriority', (req, res) => {

	const id = req.query.id || "";
	const value = req.query.value || "";
	const search = req.query.search || "";
	const page = req.query.page || 1;

	var rawData = fs.readFileSync('./data.json');
	var obj = JSON.parse(rawData.toString());
	for(var i = 0; i < obj.length; i++){
		if(obj[i].id === id)
			obj[i].priority = value;
	}
	
	fs.writeFileSync('./data.json', JSON.stringify(obj, null, 2));

	var search_pages = [];
    search_pages = obj.filter((t: any) => 
	 	(t.title.toLowerCase() + t.content.toLowerCase()).includes(search.toLowerCase()))

	const paginatedData = search_pages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	res.send(paginatedData);
});



app.listen(PORT);
console.log('server running', PORT)


