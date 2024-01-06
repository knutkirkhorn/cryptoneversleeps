import discordWebhookWrapper from 'discord-webhook-wrapper';
import {EmbedBuilder} from 'discord.js';
import config from './config.js';

const webhookClient = discordWebhookWrapper(config);

export async function sendDiscordMessage(title, message) {
	const embedMessage = new EmbedBuilder()
		.setTitle(title)
		.setFields({name: 'Message', value: message});

	await webhookClient.send({embeds: [embedMessage]});
}

export async function sendDiscordErrorMessage(message) {
	await sendDiscordMessage('Error', message);
}

export async function sendCreatedOrdersDiscordMessage(markets) {
	const embedMessage = new EmbedBuilder()
		.setTitle('Firi orders created')
		.setFields({name: 'Markets', value: markets.join(', ')});

	await webhookClient.send({embeds: [embedMessage]});
}
