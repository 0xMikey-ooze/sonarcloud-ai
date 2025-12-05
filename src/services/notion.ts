import { Client } from '@notionhq/client';
import { CreateNotionTaskParams } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class NotionService {
    private notion: Client;
    private databaseId: string;

    constructor() {
        this.notion = new Client({ auth: process.env.NOTION_API_KEY });
        this.databaseId = process.env.NOTION_DATABASE_ID || '';

        if (!this.databaseId) {
            console.warn("WARNING: NOTION_DATABASE_ID is not set.");
        }
    }

    async createTask(params: CreateNotionTaskParams): Promise<string> {
        try {
            const response = await this.notion.pages.create({
                parent: { database_id: this.databaseId },
                properties: {
                    'Task name': {
                        title: [{ text: { content: params.title } }]
                    },
                    'Status': {
                        status: { name: 'Not started' }
                    },
                    'Priority': {
                        select: { name: params.priority } // "Low", "Medium", or "High"
                    },
                    'Type of Job ': {
                        multi_select: [{ name: 'Maintenance' }] // Defaulting to Maintenance as per schema snippet
                    },
                    'Contact email': {
                        rich_text: [{ text: { content: params.customer_email } }]
                    },
                    'Summary': {
                        rich_text: [{ text: { content: params.summary } }]
                    },
                    'Description': {
                        rich_text: [{ text: { content: `Intercom ID: ${params.intercom_conversation_id}\n\nTroubleshooting:\n${params.troubleshooting_steps.join('\n')}\n\nNotes:\n${params.notes || ''}` } }]
                    }
                }
            });

            return response.id;
        } catch (error) {
            console.error("Error creating Notion task:", error);
            throw error;
        }
    }
}
