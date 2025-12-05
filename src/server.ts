import express from 'express';
import bodyParser from 'body-parser';
import { SupportAgent } from './agent';
import { ActionRunner } from './runner';
import * as dotenv from 'dotenv';
import { IncomingMessage } from './types';
import { SonarAgentMCP } from './mcp_server';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const agent = new SupportAgent();
const runner = new ActionRunner();

// MCP Setup
const mcp = new SonarAgentMCP();
const mcpServer = mcp.getServer();

// Store active transports to route POST messages (Simple in-memory map)
// In a real usage, you'd likely map session IDs or rely on a more complex server adapter
let activeTransport: SSEServerTransport | null = null;

app.get('/', (req, res) => {
    res.send('SonarCloud Agent is Running 🤖 (Webhook + MCP)');
});

// MCP SSE Endpoint
app.get('/sse', async (req, res) => {
    console.log("🔌 New MCP Connection via SSE");

    // Create a new transport for this connection
    // We point the client to POST /message for incoming JSON-RPC
    const transport = new SSEServerTransport("/message", res);

    // For this simple single-instance demo, we store the last transport
    // WARNING: This is a simplification; handling concurrent users requires session management
    activeTransport = transport;

    await mcpServer.connect(transport);
});

// MCP Message Endpoint
app.post('/message', async (req, res) => {
    if (!activeTransport) {
        res.status(400).send("No active SSE connection found.");
        return;
    }

    console.log("📨 MCP POST Message Received");
    await activeTransport.handlePostMessage(req, res);
});

// Intercom Webhook Endpoint
app.post('/webhook/intercom', async (req, res) => {
    try {
        const payload = req.body;
        console.log("📩 Received Webhook:", payload.topic || 'Unknown Topic');

        if (payload.topic === 'conversation.user.created' || payload.topic === 'conversation.user.replied') {
            const conversation = payload.data.item;
            const userMessagePart = conversation.conversation_parts ? conversation.conversation_parts.conversation_parts[0] : conversation.source;

            const incomingMsg: IncomingMessage = {
                customer_name: conversation.user.name || "Unknown User",
                customer_email: conversation.user.email || "unknown@example.com",
                school_name: conversation.custom_attributes?.school_name || "Unknown School",
                conversation_id: conversation.id,
                message_body: userMessagePart.body.replace(/<[^>]*>?/gm, ''), // Strip HTML
                previous_messages: [],
                customer_history: null
            };

            console.log(`🧠 Processing message from ${incomingMsg.customer_name}: "${incomingMsg.message_body}"`);

            const agentOutput = await agent.processMessage(incomingMsg);
            await runner.run(agentOutput);

            res.status(200).send('Processed');
        } else {
            console.log("Skipping topic:", payload.topic);
            res.status(200).send('Skipped');
        }

    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
    console.log(`📡 Webhook endpoint: POST http://localhost:${port}/webhook/intercom`);
    console.log(`🔌 MCP SSE endpoint: GET http://localhost:${port}/sse`);
});
