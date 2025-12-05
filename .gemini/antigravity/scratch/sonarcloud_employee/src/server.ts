import express from 'express';
import bodyParser from 'body-parser';
import { SupportAgent } from './agent';
import { ActionRunner } from './runner';
import * as dotenv from 'dotenv';
import { IncomingMessage } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Raw body parser might be needed for verifying signatures in real production
app.use(bodyParser.json());

const agent = new SupportAgent();
const runner = new ActionRunner();

app.get('/', (req, res) => {
    res.send('SonarCloud Agent is Running 🤖');
});

// Intercom Webhook Endpoint
app.post('/webhook/intercom', async (req, res) => {
    try {
        const payload = req.body;

        // Basic validation - check if it's a conversation.user.created or conversation.user.replied
        // Real Intercom payload structure: https://developers.intercom.com/docs/references/webhooks/payloads/

        console.log("📩 Received Webhook:", payload.topic || 'Unknown Topic');

        // Verify if it's a message we should handle
        if (payload.topic === 'conversation.user.created' || payload.topic === 'conversation.user.replied') {
            const conversation = payload.data.item;
            const userMessagePart = conversation.conversation_parts ? conversation.conversation_parts.conversation_parts[0] : conversation.source;

            // Normalize to our IncomingMessage type
            const incomingMsg: IncomingMessage = {
                customer_name: conversation.user.name || "Unknown User",
                customer_email: conversation.user.email || "unknown@example.com",
                school_name: conversation.custom_attributes?.school_name || "Unknown School",
                conversation_id: conversation.id,
                message_body: userMessagePart.body.replace(/<[^>]*>?/gm, ''), // Strip HTML
                previous_messages: [], // Ideally fetch previous parts
                customer_history: null
            };

            console.log(`🧠 Processing message from ${incomingMsg.customer_name}: "${incomingMsg.message_body}"`);

            // 1. Analyze & Decide
            const agentOutput = await agent.processMessage(incomingMsg);

            // 2. Execute Actions
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
});
