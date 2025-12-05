import { AgentOutput, Action } from './types';
import { NotionService } from './services/notion';
import { GmailService } from './services/gmail';
import { IntercomService } from './services/intercom';

export class ActionRunner {
    private notionService: NotionService;
    private gmailService: GmailService;
    private intercomService: IntercomService;

    constructor() {
        this.notionService = new NotionService();
        this.gmailService = new GmailService();
        this.intercomService = new IntercomService();
    }

    async run(output: AgentOutput): Promise<void> {
        console.log(`\n-- - Execution for: ${output.analysis.summary} --- `);

        for (const action of output.actions) {
            console.log(`Executing tool: ${action.tool} `);

            try {
                switch (action.tool) {
                    case 'create_notion_task':
                        // TypeScript narrowings
                        const notionParams = action.parameters as any; // Cast for simplicity, validating at runtime preferred in production
                        const taskId = await this.notionService.createTask(notionParams);
                        console.log(`✅ Notion Task Created! ID: ${taskId} `);
                        break;

                    case 'draft_email':
                        const emailParams = action.parameters as any;
                        await this.gmailService.createDraft(emailParams);
                        console.log("💌 Email draft created!");
                        break;



                    case 'escalate_to_human':
                        console.log("🚨 ESCALATION TRIGGERED:", action.parameters);
                        // Send email to stakeholders
                        await this.gmailService.createDraft({
                            to: "JBAPTISTE@GETSONARCLOUD.COM, ROMAN@GETSONARCLOUD.COM",
                            subject: `🚨 ESCALATION REQUIRED: ${output.analysis.summary}`,
                            body: `Automatic Escalation Triggered.\n\nReason: ${(action.parameters as any).reason}\nUrgency: ${(action.parameters as any).urgency}\n\nNotion Task ID will be created shortly.`
                        });
                        console.log("📨 Escalation email draft created for JBAPTISTE & ROMAN");
                        break;

                    case 'search_knowledge_base':
                        console.log("🔍 Searching KB:", action.parameters);
                        break;

                    default:
                        console.warn(`Unknown tool: ${action.tool} `);
                }
            } catch (err) {
                console.error(`Failed to execute ${action.tool}: `, err);
            }
        }
    }
}
