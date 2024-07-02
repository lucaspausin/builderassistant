import "dotenv/config";
import {
	createBot,
	createProvider,
	createFlow,
	addKeyword,
	EVENTS,
} from "@builderbot/bot";

import { createReadStream } from "fs";
import { join } from "path";

import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { toAsk } from "@builderbot-plugins/openai-assistants";
import { typing } from "./utils/presence";
import sendMessageWoodChat from "./services/chatwood2";

const PORT = process.env?.PORT ?? 3003;
const ASSISTANT_ID = process.env?.ASSISTANT_ID ?? "";

const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME).addAction(
	async (ctx, { flowDynamic, state, provider, globalState }) => {
		const botOffForEveryOne = globalState.get<boolean>("botOffForEveryOne");
		if (botOffForEveryOne) return;
		await typing(ctx, provider);
		const response = await toAsk(ASSISTANT_ID, ctx.body, state);

		const chunks = response.split(/\n\n+/);

		for (const chunk of chunks) {
			await flowDynamic([{ body: chunk.trim().replace(/【.*?】/g, "") }]);
			await sendMessageWoodChat(chunk.trim().replace(/【.*?】/g, ""));
		}
	}
);

const botOffFlow = addKeyword<Provider, Database>("botoff")
	.addAction(async (_, { globalState, endFlow }) => {
		const botOffForEveryOne =
			globalState.get<boolean>("botOffForEveryOne") ?? false;
		await globalState.update({ botOffForEveryOne: !botOffForEveryOne });
		if (!botOffForEveryOne) {
			return endFlow();
		}
	})
	.addAnswer("El bot está prendido de vuelta.");

const main = async () => {
	const adapterFlow = createFlow([welcomeFlow, botOffFlow]);
	const adapterProvider = createProvider(Provider);
	const adapterDB = new Database();

	const { httpServer, handleCtx } = await createBot({
		flow: adapterFlow,
		provider: adapterProvider,
		database: adapterDB,
	});

	try {
		await sendMessageWoodChat("ejemplo inicial");
	} catch (error) {
		console.error("Error sending initial message:", error);
	}

	httpServer(+PORT);

	adapterProvider.server.post(
		"/chatwood-hook",
		handleCtx(async (bot, req, res) => {
			const body = req.body;
			if (body.private) {
				res.send(null);
				return;
			}
			const phone = body.conversation.meta.sender.phone_number.replace("+", "");
			await bot.sendMessage(phone, body.content, {});
		})
	);
};

main();
