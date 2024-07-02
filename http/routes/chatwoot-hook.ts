import express, { Request, Response } from "express";
import { createReadStream } from "fs";
import { join } from "path";

const app = express();
const router = express.Router();

app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON

// Define una interfaz extendida para el Request de Express
interface CustomRequest extends Request {
	providerWs?: any; // Tipo de tu propiedad personalizada providerWs
}

const chatWoodHook = async (req: CustomRequest, response: Response) => {
	const providerWs = req.providerWs;
	console.log(providerWs);
	const body = req.body;
	const phone = body?.conversation?.meta?.sender?.phone_number.replace("+", "");
	console.log(phone);

	await providerWs.sendText("52XXXXXXXXX@c.us", "Mensaje desde API");
	response.send(body);
};

router.post("/chatwood-hook", chatWoodHook);

router.get("/get-qr", async (_, res) => {
	const YOUR_PATH_QR = join(process.cwd(), `bot.qr.png`);
	const fileStream = createReadStream(YOUR_PATH_QR);

	fileStream.on("open", () => {
		res.setHeader("Content-Type", "image/png");
		fileStream.pipe(res);
	});

	fileStream.on("error", (err) => {
		res.status(500).send("Internal Server Error");
	});
});

app.use(router);

export { router };
