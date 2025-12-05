import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import { RagService } from './services/rag';
import { SupportAgent } from './agent';
import { ActionRunner } from './runner';
import { IncomingMessage } from "./types";

// Define schemas outside to avoid type inference issues
const QueryKBSchema = {
    query: z.string()
};

const CreateTaskSchema = {
    issue: z.string().describe("The full description of the customer issue"),
    customer_name: z.string().optional(),
    customer_email: z.string().optional(),
    school_name: z.string().optional()
};

export class SonarAgentMCP {
    private server: McpServer;
    private ragService: RagService;
    private agent: SupportAgent;
    private runner: ActionRunner;

    constructor() {
        this.server = new McpServer({
            name: "SonarCloud Support Agent",
            version: "1.0.0"
        });

        this.ragService = new RagService();
        this.agent = new SupportAgent();
        this.runner = new ActionRunner();

        this.setupTools();
        this.setupResources();
    }

    private setupTools() {
        const ragService = this.ragService;
        const agent = this.agent;
        const runner = this.runner;
        
        // Cast to any to bypass MCP SDK's overly complex type inference
        const server = this.server as any;

        // Tool: Query Knowledge Base (RAG)
        server.tool(
            "query_knowledge_base",
            "Search the SonarCloud support knowledge base and past issues.",
            QueryKBSchema,
            async ({ query }: { query: string }) => {
                const results = ragService.search(query);
                return {
                    content: [{ type: "text", text: results.length > 0 ? results.join("\n\n") : "No matches found." }]
                };
            }
        );

        // Tool: Create Support Task / Handle Issue
        server.tool(
            "create_support_task",
            "Process a support issue: analyzes it, creates a Notion task, and drafts an email.",
            CreateTaskSchema,
            async ({ issue, customer_name, customer_email, school_name }: { issue: string; customer_name?: string; customer_email?: string; school_name?: string }) => {
                const message: IncomingMessage = {
                    message_body: issue,
                    customer_name: customer_name || "MCP User",
                    customer_email: customer_email || "mcp@example.com",
                    school_name: school_name || "Unknown School",
                    conversation_id: `mcp_${Date.now()}`,
                    previous_messages: [],
                    customer_history: null
                };

                const output = await agent.processMessage(message);
                await runner.run(output);

                return {
                    content: [{
                        type: "text",
                        text: `Processed successfully.\nSummary: ${output.analysis.summary}\nActions Taken: ${output.actions.map(a => a.tool).join(", ")}`
                    }]
                };
            }
        );
    }

    private setupResources() {
        // Resource: History JSON
        this.server.resource(
            "history",
            "history://latest",
            async (uri) => {
                const dataPath = path.join(__dirname, 'data/history.json');
                const rawData = fs.readFileSync(dataPath, 'utf-8');
                return {
                    contents: [{
                        uri: uri.href,
                        text: rawData
                    }]
                };
            }
        );
    }

    // Helper to connect an Express Response as the SSE transport
    public async connectSSE(req: any, res: any) {
        const transport = new SSEServerTransport("/message", res);
        await this.server.connect(transport);
    }

    // Helper to handle the POST message for SSE
    public async handleMessage(req: any, res: any) {
        // In a real implementation with `mcp-sdk`, we'd route the message to the active transport.
        // However, the current standard SDK setup for Express usually involves creating 
        // a transport instance per connection.
        // For simplicity in this demo, we assume the transport handles the lifetime.
        // Note: The official express adapter for MCP logic might differ slightly as the SDK evolves.

        // This part requires careful handling in the Express route directly 
        // because we need the transport instance created in `connectSSE`.
    }

    public getServer() {
        return this.server;
    }
}
