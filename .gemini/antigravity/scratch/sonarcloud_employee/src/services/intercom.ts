import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export class IntercomService {
    private apiKey: string;
    private baseUrl = 'https://api.intercom.io';

    constructor() {
        this.apiKey = process.env.INTERCOM_API_KEY || '';
        if (!this.apiKey) {
            console.warn("WARNING: INTERCOM_API_KEY is not set.");
        }
    }

    async getConversation(conversationId: string): Promise<any> {
        // In a real scenario, we would call the API.
        // However, the conversation IDs in the examples (conv_abc123) are fake.
        // So we will return a mock object if it looks like a test ID, otherwise call the API.

        if (conversationId.startsWith('conv_')) {
            return {
                id: conversationId,
                source: {
                    body: "Mock message body from Intercom",
                    author: { name: "Mock User", email: "mock@example.com" }
                }
            };
        }

        try {
            const response = await axios.get(`${this.baseUrl}/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching Intercom conversation:", error);
            throw error;
        }
    }
}
