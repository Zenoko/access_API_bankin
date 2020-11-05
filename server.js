var http = require("http");
var url = require("url");
const axios = require('axios');
const qs = require('querystring');
fs = require('fs');


// ******** Informations d'auth ********
var loginBankinAPI = "BankinUser";
var passwordBankinAPI = "12345678";
var clientId = "BankinClientId";
var clientSecret = "secret";

// ******** FIN Informations d'auth ********

// URL API Bankin
var url = "http://localhost:3000";

/** @description Get refresh token
	* @param {} : None
	* @return {refreshToken}
*/
async function getRefreshToken() {
	
	const options = {
		method: 'post',
		headers: {
			'content-type': 'application/json'
		},
		auth: {
			username: clientId,
			password: clientSecret
		},
		baseURL: url,
		url: '/login',
		data: {
			user: loginBankinAPI,
			password: passwordBankinAPI
		}
	}
	
	try {
		let response = await axios(options);
		let refreshToken = response.data.refresh_token;
		console.log("");
		console.log("*************** REFRESH TOKEN ***************");
		console.log(refreshToken);
		console.log("************* FIN REFRESH TOKEN *************");
		console.log("");
		return await Promise.resolve(refreshToken);
		
		} catch (error) {
		console.error('Could not get the refresh token: '+ error);
	}
}

/** @description Get access token
	* @return {AccessToken}
*/
async function getAccessToken() {
	
	const result = await getRefreshToken();
	
	const requestBody = {
		grant_type: 'refresh_token',
		refresh_token: qs.stringify(result)
	}
	
	// console.log(requestBody);
	
	const options = {
		method: 'post',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		baseURL: url,
		url: '/token',
		data: qs.stringify({
			grant_type: 'refresh_token',
			refresh_token: result
		})
	}
	
	try {
		let response = await axios(options);
		let AccessToken = response.data.access_token;
		
		console.log("*************** ACCESS TOKEN ***************");
		console.log(AccessToken);
		console.log("************* FIN ACCESS TOKEN *************");
		console.log("");
		return await Promise.resolve(AccessToken);
		
		} catch (error) {
		console.error('Could not get the access token:' +error);
	}
}

/** @description Get all transactions for each account
	* @return {accounts, transactions}
*/
async function getAllAccounts() {
	
	const result = await getAccessToken();
	
	const getAccountUrl = url+'/accounts?page=';
	const getTransactionUrl = url+'/accounts/';
	
	let page = 1;
	
	// create empty array where we want to store accounts
	let accounts = [];
	
	
	// create a lastResult array which is going to be used to check if there is a next page
	let lastResult = [];
	
	do {
		// try catch to catch any errors in the async api call
		try 
		{
			const options = 
			{
				method: 'get',
				headers: {
					'content-type': 'application/json',
					'Authorization': 'Bearer '+result
				},
				url: getAccountUrl+page
			}
			
			let resp = await axios(options);
			
			lastResult = resp.data;
			// console.log(lastResult);
			
			for(const [i,account] of resp.data.account.entries())
			{			
				let transactions = [];
				
				// destructure the account object and add to array
				const { acc_number, amount } = account;
				accounts.push({ "acc_number":acc_number, "amount":amount, transactions});
			}
			
			// continue;
			// increment the page with 1 on each loop
			page++;
		} catch (err) 
		{
			console.error('Oeps, something is wrong '+ err);
		}
		// keep running until there's no next page
	} while (lastResult.link.next !== null && page <= 3);
	
	
	for(var i=0; i < accounts.length; i++)
	{
		
		let pageT = 1;
		
		// create a lastResult array which is going to be used to check if there is a next page
		let lastResultT = [];
		
		do {
			// try catch to catch any errors in the async api call
			try 
			{		
				const optionsT = 
				{
					method: 'get',
					headers: {
						'content-type': 'application/json',
						'Authorization': 'Bearer '+result
					},
					url: getTransactionUrl+accounts[i].acc_number+"/transactions?page="+pageT
				}
				// Use node-fetch to make api call
				let respT = await axios(optionsT);
				
				lastResultT = respT.data;
				
				respT.data.transactions.forEach(transaction => 
					{
						// destructure the transaction object and add to array
						const { label, amount, currency } = transaction;
						accounts[i].transactions.push({ label, amount, currency });
					});
					// increment the page with 1 on each loop
					pageT++;
			} catch (err) 
			{
				break;
			}
			
			// keep running until there's no next page
		} while (lastResultT.link.next !== null);
		continue;
	}
	
	stringAccounts = JSON.stringify(accounts, null, 4);
	console.log("*************** ACCOUNTS ***************");
	console.log(stringAccounts);
	console.log("************* FIN ACCOUNTS *************");
	console.log("");
	
	return await Promise.resolve(accounts);
}

module.exports = {
	getRefreshToken,
	getAccessToken,
	getAllAccounts
}	