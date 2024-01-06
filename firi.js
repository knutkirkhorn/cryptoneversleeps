import got from 'got';
import {z} from 'zod';
import BigNumber from 'bignumber.js';
import getPackageUserAgent from 'package-user-agent';
import config from './config.js';
import {sendDiscordErrorMessage} from './discord-messaging.js';

const baseApiUrl = 'https://api.firi.com';
const {apiKey} = config;
const packageUserAgent = await getPackageUserAgent();

const balanceSchema = z.object({
	currency: z.string(),
	balance: z.coerce.number(),
	hold: z.string(),
	available: z.coerce.number(),
});

async function getBalances() {
	console.log('asd', {
		'firi-access-key': apiKey,
		...packageUserAgent,
	});
	const response = await got(`${baseApiUrl}/v2/balances`, {
		headers: {
			'firi-access-key': apiKey,
			...packageUserAgent,
		},
	});
	return JSON.parse(response.body);
}

export async function checkIfSufficientBalance(neededBalance) {
	const balances = await getBalances();

	if (!Array.isArray(balances)) {
		await sendDiscordErrorMessage('Failed to get balances');
		throw new Error('Failed to get balances');
	}

	const nokBalance = balances.find(balance => balance.currency === 'NOK');
	const parsedNokBalance = balanceSchema.parse(nokBalance);
	return parsedNokBalance.available >= neededBalance;
}

const marketTickerSchema = z.object({
	bid: z.coerce.number(),
	ask: z.coerce.number(),
	spread: z.coerce.number(),
});

const orderSchema = z.object({
	id: z.number(),
});

export async function createOrder(market, nokPrice) {
	const response = await got(`${baseApiUrl}/v2/markets/${market}/ticker`, {
		headers: {
			'firi-access-key': apiKey,
			...packageUserAgent,
		},
	});

	const buyPrice = marketTickerSchema.parse(JSON.parse(response.body)).ask;
	const buyAmount = BigNumber(nokPrice).div(buyPrice);

	const buyResponse = await got(`${baseApiUrl}/v2/orders`, {
		headers: {
			'firi-access-key': apiKey,
			...packageUserAgent,
		},
		method: 'POST',
		json: {
			market,
			type: 'bid',
			price: `${buyPrice}`,
			amount: `${buyAmount}`,
		},
	});
	const order = JSON.parse(buyResponse.body);
	orderSchema.parse(order);
}
