import { IncomingMessage, AgentOutput } from './types';
export declare class SupportAgent {
    private openai;
    constructor(apiKey?: string);
    processMessage(message: IncomingMessage): Promise<AgentOutput>;
}
//# sourceMappingURL=agent.d.ts.map