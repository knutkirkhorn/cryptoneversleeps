import dotenv from 'dotenv';
import {z} from 'zod';

// Load the stored variables from `.env` file into process.env
dotenv.config();

const environmentSchema = z.object({
	FIRI_API_KEY: z.string().min(1),
	DISCORD_WEBHOOK_URL: z.string().min(1),
});
const parsedEnvironment = environmentSchema.parse(process.env);

export default {
	apiKey: parsedEnvironment.FIRI_API_KEY,
	discordWebhookUrl: parsedEnvironment.DISCORD_WEBHOOK_URL,
};
