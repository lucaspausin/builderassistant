class ChatWood {
	private api: string = "https://chatwoot-production-c000.up.railway.app";
	private accessToken: string = "hYbevd7JX9EHkeG88dx6uMi4";

	buildHeader(): HeadersInit {
		return {
			"Content-Type": "application/json",
			api_access_token: this.accessToken,
		};
	}

	createMessage = async (dataIn: {
		content: string;
		message_type: string;
	}): Promise<any> => {
		const requestOptions: RequestInit = {
			method: "POST",
			headers: this.buildHeader(),
			body: JSON.stringify({
				content: dataIn.content,
				message_type: dataIn.message_type,
				private: true,
				content_attributes: {},
			}),
		};

		const url = `${this.api}/api/v1/accounts/1/conversations/2/messages`;

		try {
			const response = await fetch(url, requestOptions);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error("Error creating message:", error);
			throw error;
		}
	};
}

// Crear una instancia de ChatWood y exportar la función createMessage
const chatWoodInstance = new ChatWood();

const sendMessageWoodChat = (content: string) => {
	return chatWoodInstance.createMessage({ content, message_type: "incoming" });
};

export default sendMessageWoodChat;
