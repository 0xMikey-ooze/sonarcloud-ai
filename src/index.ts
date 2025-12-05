import { SupportAgent } from './agent';
import { IncomingMessage } from './types';
import { ActionRunner } from './runner';

const example1: IncomingMessage = {
    customer_name: "Maria Rodriguez",
    customer_email: "mrodriguez@ps123.edu",
    school_name: "PS 123",
    conversation_id: "conv_abc123",
    message_body: "The speakers in the 3rd floor hallway stopped working yesterday. We tried restarting the system but nothing changed. This is affecting our afternoon announcements.",
    previous_messages: [],
    customer_history: null
};

const example2: IncomingMessage = {
    customer_name: "James Wilson",
    customer_email: "jwilson@charter-academy.org",
    school_name: "Charter Academy",
    conversation_id: "conv_xyz789",
    message_body: "This is unacceptable. The emergency alert system failed during our fire drill today. We've reported this THREE times now and nothing has been fixed. I need to speak with a manager immediately or we will be looking for a new vendor.",
    previous_messages: [],
    customer_history: "2 previous tickets about emergency alert delays in past 30 days"
};

const example3: IncomingMessage = {
    customer_name: "Sarah Connors",
    customer_email: "sarah@skynet-high.edu",
    school_name: "Skynet High",
    conversation_id: "conv_rag456",
    message_body: "We are hearing a weird buzzing noise from the speakers in the cafeteria. It's constant.",
    previous_messages: [],
    customer_history: null
};

async function runExamples() {
    const agent = new SupportAgent(); // Will use process.env.OPENAI_API_KEY
    const runner = new ActionRunner();

    console.log("--- Processing Example 1 ---");
    try {
        const result1 = await agent.processMessage(example1);
        console.log(JSON.stringify(result1, null, 2));
        await runner.run(result1);
    } catch (error) {
        console.error("Failed Example 1:", error);
    }

    console.log("\n--- Processing Example 2 ---");
    try {
        const result2 = await agent.processMessage(example2);
        console.log(JSON.stringify(result2, null, 2));
        await runner.run(result2);
    } catch (error) {
        console.error("Failed Example 2:", error);
    }

    console.log("\n--- Processing Example 3 (RAG Test) ---");
    try {
        const result3 = await agent.processMessage(example3);
        console.log("Analysis Summary:", result3.analysis.summary);
        // We expect it to find the ground loop solution
        await runner.run(result3);
    } catch (error) {
        console.error("Failed Example 3:", error);
    }
}

runExamples();
