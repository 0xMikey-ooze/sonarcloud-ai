"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionService = void 0;
const client_1 = require("@notionhq/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class NotionService {
    constructor() {
        this.notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
        this.databaseId = process.env.NOTION_DATABASE_ID || '';
        if (!this.databaseId) {
            console.warn("WARNING: NOTION_DATABASE_ID is not set.");
        }
    }
    async createTask(params) {
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
        }
        catch (error) {
            console.error("Error creating Notion task:", error);
            throw error;
        }
    }
}
exports.NotionService = NotionService;
