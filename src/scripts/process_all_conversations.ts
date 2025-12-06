import { IntercomService, IntercomConversation } from '../services/intercom';
import { SupportAgent } from '../agent';
import { ActionRunner } from '../runner';
import { IncomingMessage } from '../types';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SIX_DAYS_IN_SECONDS = 6 * 24 * 60 * 60;
const OUTPUT_DIR = path.join(__dirname, '../../output');

interface ProcessedConversation {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    original_message: string;
    ai_analysis: any;
    ai_response: string;
    should_respond: boolean;
    age_days: number;
}

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>?/gm, '').trim() || '';
}

function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString();
}

function getDaysAgo(timestamp: number): number {
    const now = Date.now() / 1000;
    return Math.floor((now - timestamp) / (24 * 60 * 60));
}

async function main() {
    console.log("🚀 Starting Intercom Conversation Processor");
    console.log("=" .repeat(60));

    const intercom = new IntercomService();
    const agent = new SupportAgent();
    const runner = new ActionRunner();

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Step 1: Fetch ALL conversations
    console.log("\n📥 STEP 1: Fetching all conversations from Intercom...\n");
    const allConversations = await intercom.listAllConversations();

    if (allConversations.length === 0) {
        console.log("❌ No conversations found. Check your INTERCOM_API_KEY.");
        return;
    }

    // Step 2: Categorize conversations
    const now = Date.now() / 1000;
    const sixDaysAgo = now - SIX_DAYS_IN_SECONDS;

    const recentConversations = allConversations.filter(c => c.created_at >= sixDaysAgo);
    const olderConversations = allConversations.filter(c => c.created_at < sixDaysAgo);

    console.log("\n📊 STEP 2: Conversation Breakdown");
    console.log("=" .repeat(60));
    console.log(`   Total conversations: ${allConversations.length}`);
    console.log(`   Past 6 days (will process): ${recentConversations.length}`);
    console.log(`   Older (archive only): ${olderConversations.length}`);

    // Step 3: Save all conversations to archive
    console.log("\n💾 STEP 3: Saving all conversations to archive...");
    const archivePath = path.join(OUTPUT_DIR, 'all_conversations.json');
    fs.writeFileSync(archivePath, JSON.stringify(allConversations, null, 2));
    console.log(`   Saved to: ${archivePath}`);

    // Step 4: Process recent conversations with AI
    console.log("\n🤖 STEP 4: Processing recent conversations with AI...");
    console.log("=" .repeat(60));

    const processedResults: ProcessedConversation[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (let i = 0; i < recentConversations.length; i++) {
        const conv = recentConversations[i];
        const progress = `[${i + 1}/${recentConversations.length}]`;

        try {
            // Get full conversation details
            const fullConv = await intercom.getConversation(conv.id);
            if (!fullConv) {
                console.log(`${progress} ⚠️  Could not fetch details for ${conv.id}`);
                continue;
            }

            // Extract customer info
            let customerName = "Unknown User";
            let customerEmail = "unknown@example.com";
            let schoolName = "Unknown School";

            if (fullConv.contacts?.contacts?.length > 0) {
                const contactId = fullConv.contacts.contacts[0].id;
                const contact = await intercom.getContact(contactId);
                if (contact) {
                    customerName = contact.name || customerName;
                    customerEmail = contact.email || customerEmail;
                    schoolName = contact.custom_attributes?.school_name || schoolName;
                }
            }

            // Get the original message
            const messageBody = stripHtml(fullConv.source?.body || '');
            if (!messageBody) {
                console.log(`${progress} ⚠️  Empty message body for ${conv.id}`);
                continue;
            }

            // Build previous messages from conversation parts
            const previousMessages: string[] = [];
            if (fullConv.conversation_parts?.conversation_parts) {
                for (const part of fullConv.conversation_parts.conversation_parts.slice(0, 5)) {
                    if (part.body) {
                        const author = part.author?.type === 'admin' ? 'Agent' : 'Customer';
                        previousMessages.push(`${author}: ${stripHtml(part.body)}`);
                    }
                }
            }

            const daysAgo = getDaysAgo(conv.created_at);
            console.log(`\n${progress} Processing conversation ${conv.id}`);
            console.log(`   From: ${customerName} <${customerEmail}>`);
            console.log(`   School: ${schoolName}`);
            console.log(`   Age: ${daysAgo} days ago`);
            console.log(`   Message: "${messageBody.substring(0, 80)}${messageBody.length > 80 ? '...' : ''}"`);

            // Create incoming message for AI
            const incomingMsg: IncomingMessage = {
                customer_name: customerName,
                customer_email: customerEmail,
                school_name: schoolName,
                conversation_id: conv.id,
                message_body: messageBody,
                previous_messages: previousMessages,
                customer_history: null
            };

            // Process with AI
            console.log(`   🤖 Analyzing with AI...`);
            const agentOutput = await agent.processMessage(incomingMsg);

            // Extract the drafted email response
            const emailAction = agentOutput.actions.find(a => a.tool === 'draft_email');
            const emailBody = emailAction ? (emailAction.parameters as any).body : 'No response drafted';

            const processed: ProcessedConversation = {
                id: conv.id,
                created_at: formatDate(conv.created_at),
                customer_name: customerName,
                customer_email: customerEmail,
                original_message: messageBody,
                ai_analysis: agentOutput.analysis,
                ai_response: emailBody,
                should_respond: !agentOutput.analysis.requires_escalation,
                age_days: daysAgo
            };

            processedResults.push(processed);

            console.log(`   ✅ Category: ${agentOutput.analysis.category}`);
            console.log(`   ✅ Priority: ${agentOutput.analysis.priority}`);
            console.log(`   ✅ Escalation: ${agentOutput.analysis.requires_escalation ? 'YES' : 'No'}`);

            // Execute actions (creates Notion tasks, email drafts)
            console.log(`   📝 Executing actions...`);
            await runner.run(agentOutput);

            // Rate limit protection
            await sleep(1000);

        } catch (error: any) {
            console.error(`${progress} ❌ Error processing ${conv.id}:`, error.message);
            errors.push({ id: conv.id, error: error.message });
        }
    }

    // Step 5: Save results
    console.log("\n💾 STEP 5: Saving results...");
    console.log("=" .repeat(60));

    const resultsPath = path.join(OUTPUT_DIR, 'processed_conversations.json');
    fs.writeFileSync(resultsPath, JSON.stringify(processedResults, null, 2));
    console.log(`   Processed results: ${resultsPath}`);

    const errorsPath = path.join(OUTPUT_DIR, 'errors.json');
    fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2));
    console.log(`   Errors: ${errorsPath}`);

    // Generate summary report
    const report = generateReport(processedResults, olderConversations, errors);
    const reportPath = path.join(OUTPUT_DIR, 'report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`   Report: ${reportPath}`);

    // Final summary
    console.log("\n" + "=" .repeat(60));
    console.log("📊 FINAL SUMMARY");
    console.log("=" .repeat(60));
    console.log(`   Total fetched: ${allConversations.length}`);
    console.log(`   Processed (past 6 days): ${processedResults.length}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Archived (older): ${olderConversations.length}`);
    console.log("\n✅ Done! Check the /output folder for results.");
}

function generateReport(
    processed: ProcessedConversation[],
    older: IntercomConversation[],
    errors: Array<{ id: string; error: string }>
): string {
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let escalations = 0;

    for (const p of processed) {
        byCategory[p.ai_analysis.category] = (byCategory[p.ai_analysis.category] || 0) + 1;
        byPriority[p.ai_analysis.priority] = (byPriority[p.ai_analysis.priority] || 0) + 1;
        if (p.ai_analysis.requires_escalation) escalations++;
    }

    let report = `# Intercom Conversation Processing Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total Conversations Fetched | ${processed.length + older.length} |
| Processed (Past 6 Days) | ${processed.length} |
| Archived (Older) | ${older.length} |
| Errors | ${errors.length} |
| Escalations Required | ${escalations} |

## By Category

| Category | Count |
|----------|-------|
${Object.entries(byCategory).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## By Priority

| Priority | Count |
|----------|-------|
${Object.entries(byPriority).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## Processed Conversations

${processed.map(p => `
### ${p.id}
- **Customer:** ${p.customer_name} (${p.customer_email})
- **Date:** ${p.created_at} (${p.age_days} days ago)
- **Category:** ${p.ai_analysis.category}
- **Priority:** ${p.ai_analysis.priority}
- **Escalation:** ${p.ai_analysis.requires_escalation ? '⚠️ YES' : 'No'}

**Original Message:**
> ${p.original_message.substring(0, 200)}${p.original_message.length > 200 ? '...' : ''}

**AI Summary:**
> ${p.ai_analysis.summary}

**Drafted Response:**
> ${p.ai_response.substring(0, 300)}${p.ai_response.length > 300 ? '...' : ''}

---
`).join('\n')}

${errors.length > 0 ? `
## Errors

${errors.map(e => `- **${e.id}:** ${e.error}`).join('\n')}
` : ''}
`;

    return report;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);

