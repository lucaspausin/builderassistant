import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import { router } from "./routes/chatwoot-hook"; // Asegúrate de que la ruta sea correcta

// Define una interfaz extendida para el Request de Express
interface CustomRequest extends Request {
	providerWs: any; // Tipo de tu propiedad personalizada providerWs
}

export class ServerHttp {
	app: Express;
	port: number;
	providerWs: any;

	constructor(_providerWs: any) {
		this.app = express();
		this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003; // Parsea el puerto a un número entero
		this.providerWs = _providerWs;
	}

	buildApp = (): Server => {
		this.app
			.use(express.json()) // Middleware para parsear el cuerpo de las solicitudes como JSON
			.use((req: CustomRequest, _, next: NextFunction) => {
				req.providerWs = this.providerWs;
				next();
			})
			.use(router); // Usa el router importado

		// Crea un servidor HTTP utilizando Express
		return createServer(this.app).listen(this.port, () =>
			console.log(`Servidor listo en http://localhost:${this.port}`)
		);
	};

	start() {
		this.buildApp();
	}
}
