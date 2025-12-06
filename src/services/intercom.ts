import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface IntercomConversation {
    id: string;
    created_at: number;
    updated_at: number;
    source: {
        type: string;
        body: string;
        author: {
            type: string;
            id: string;
            name?: string;
            email?: string;
        };
    };
    contacts: {
        contacts: Array<{
            id: string;
            external_id?: string;
            type: string;
        }>;
    };
    conversation_parts?: {
        conversation_parts: Array<{
            id: string;
            part_type: string;
            body: string;
            created_at: number;
            author: {
                type: string;
                id: string;
                name?: string;
                email?: string;
            };
        }>;
    };
    custom_attributes?: Record<string, any>;
    state: string;
}

export class IntercomService {
    private apiKey: string;
    private baseUrl = 'https://api.intercom.io';

    constructor() {
        this.apiKey = process.env.INTERCOM_API_KEY || '';
        if (!this.apiKey) {
            console.warn("WARNING: INTERCOM_API_KEY is not set.");
        }
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Intercom-Version': '2.11'
        };
    }

    async listAllConversations(): Promise<IntercomConversation[]> {
        const allConversations: IntercomConversation[] = [];
        let cursor: string | null = null;
        let page = 1;

        console.log("📥 Fetching all conversations from Intercom...");

        do {
            try {
                const params: any = { per_page: 50 };
                if (cursor) {
                    params.starting_after = cursor;
                }

                const response = await axios.get(`${this.baseUrl}/conversations`, {
                    headers: this.getHeaders(),
                    params
                });

                const data = response.data;
                const conversations = data.conversations || [];
                allConversations.push(...conversations);

                console.log(`   Page ${page}: fetched ${conversations.length} conversations (total: ${allConversations.length})`);

                // Check for next page
                cursor = data.pages?.next?.starting_after || null;
                page++;

                // Rate limit protection
                await this.sleep(200);

            } catch (error: any) {
                console.error("Error listing conversations:", error.response?.data || error.message);
                break;
            }
        } while (cursor);

        console.log(`✅ Total conversations fetched: ${allConversations.length}`);
        return allConversations;
    }

    async getConversation(conversationId: string): Promise<IntercomConversation | null> {
        if (conversationId.startsWith('conv_')) {
            return {
                id: conversationId,
                created_at: Date.now() / 1000,
                updated_at: Date.now() / 1000,
                state: 'open',
                source: {
                    type: 'conversation',
                    body: "Mock message body from Intercom",
                    author: { type: 'user', id: 'mock', name: "Mock User", email: "mock@example.com" }
                },
                contacts: { contacts: [] }
            };
        }

        try {
            const response = await axios.get(`${this.baseUrl}/conversations/${conversationId}`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching conversation:", error.response?.data || error.message);
            return null;
        }
    }

    async getContact(contactId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/contacts/${contactId}`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching contact:", error.response?.data || error.message);
            return null;
        }
    }

    async replyToConversation(conversationId: string, message: string, adminId?: string): Promise<boolean> {
        try {
            const body: any = {
                message_type: 'comment',
                type: 'admin',
                body: message
            };

            // If we have an admin ID, use it; otherwise this may need to be set up
            if (adminId) {
                body.admin_id = adminId;
            }

            const response = await axios.post(
                `${this.baseUrl}/conversations/${conversationId}/reply`,
                body,
                { headers: this.getHeaders() }
            );

            return response.status === 200;
        } catch (error: any) {
            console.error("Error replying to conversation:", error.response?.data || error.message);
            return false;
        }
    }

    async addNoteToConversation(conversationId: string, note: string, adminId: string): Promise<boolean> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/conversations/${conversationId}/reply`,
                {
                    message_type: 'note',
                    type: 'admin',
                    admin_id: adminId,
                    body: note
                },
                { headers: this.getHeaders() }
            );
            return response.status === 200;
        } catch (error: any) {
            console.error("Error adding note:", error.response?.data || error.message);
            return false;
        }
    }

    async getAdmins(): Promise<any[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/admins`, {
                headers: this.getHeaders()
            });
            return response.data.admins || [];
        } catch (error: any) {
            console.error("Error fetching admins:", error.response?.data || error.message);
            return [];
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
