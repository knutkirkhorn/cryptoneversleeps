import fs from 'node:fs/promises';
import {z} from 'zod';
import {
	sendCreatedOrdersDiscordMessage,
	sendDiscordErrorMessage,
} from './discord-messaging.js';
import {checkIfSufficientBalance, createOrder} from './firi.js';

const marketBuySchema = z.object({
	market: z.string(),
	price_nok: z.number(),
});
const marketBuysSchema = z.array(marketBuySchema);

async function readMarketBuysConfig() {
	try {
		const marketBuys = await JSON.parse(
			await fs.readFile('./buy-config.json', 'utf8'),
		);
		const parsedMarketBuys = marketBuysSchema.parse(marketBuys);
		return parsedMarketBuys;
	} catch (error) {
		console.error(error);
		await sendDiscordErrorMessage('Could not read market buys file');
		throw new Error('Could not read market buys file');
	}
}

// Exit process if not saturday or sunday
const isSaturdayOrSunday =
	new Date().getDay() === 6 || new Date().getDay() === 0;
if (!isSaturdayOrSunday) {
	console.log('Not saturday or sunday, exiting...');
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit();
}

const marketBuys = await readMarketBuysConfig();
const nokSumBuys = marketBuys.reduce(
	(previous, current) => previous + current.price_nok,
	0,
);

const isSufficientBalance = await checkIfSufficientBalance(nokSumBuys);
if (!isSufficientBalance) {
	await sendDiscordErrorMessage('Balance is not sufficient');
	throw new Error('Balance is not sufficient');
}

// Create orders for all market buys
for (const marketBuy of marketBuys) {
	await createOrder(marketBuy.market, marketBuy.price_nok);
}

await sendCreatedOrdersDiscordMessage(
	marketBuys.map(marketBuy => marketBuy.market),
);
