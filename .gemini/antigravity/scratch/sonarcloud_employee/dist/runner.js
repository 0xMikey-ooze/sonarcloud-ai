"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionRunner = void 0;
const notion_1 = require("./services/notion");
const gmail_1 = require("./services/gmail");
const intercom_1 = require("./services/intercom");
class ActionRunner {
    constructor() {
        this.notionService = new notion_1.NotionService();
        this.gmailService = new gmail_1.GmailService();
        this.intercomService = new intercom_1.IntercomService();
    }
    async run(output) {
        console.log(`\n-- - Execution for: ${output.analysis.summary} --- `);
        for (const action of output.actions) {
            console.log(`Executing tool: ${action.tool} `);
            try {
                switch (action.tool) {
                    case 'create_notion_task':
                        // TypeScript narrowings
                        const notionParams = action.parameters; // Cast for simplicity, validating at runtime preferred in production
                        const taskId = await this.notionService.createTask(notionParams);
                        console.log(`✅ Notion Task Created! ID: ${taskId} `);
                        break;
                    case 'draft_email':
                        const emailParams = action.parameters;
                        await this.gmailService.createDraft(emailParams);
                        console.log("💌 Email draft created!");
                        break;
                    case 'escalate_to_human':
                        console.log("🚨 ESCALATION TRIGGERED:", action.parameters);
                        // Send email to stakeholders
                        await this.gmailService.createDraft({
                            to: "JBAPTISTE@GETSONARCLOUD.COM, ROMAN@GETSONARCLOUD.COM",
                            subject: `🚨 ESCALATION REQUIRED: ${output.analysis.summary}`,
                            body: `Automatic Escalation Triggered.\n\nReason: ${action.parameters.reason}\nUrgency: ${action.parameters.urgency}\n\nNotion Task ID will be created shortly.`
                        });
                        console.log("📨 Escalation email draft created for JBAPTISTE & ROMAN");
                        break;
                    case 'search_knowledge_base':
                        console.log("🔍 Searching KB:", action.parameters);
                        break;
                    default:
                        console.warn(`Unknown tool: ${action.tool} `);
                }
            }
            catch (err) {
                console.error(`Failed to execute ${action.tool}: `, err);
            }
        }
    }
}
exports.ActionRunner = ActionRunner;
