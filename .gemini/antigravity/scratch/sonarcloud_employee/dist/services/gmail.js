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
exports.GmailService = void 0;
const googleapis_1 = require("googleapis");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class GmailService {
    constructor() {
        // In a real CLI app, we'd need Oauth2 flow. 
        // Since we only have client ID/Secret but no refresh token/access token,
        // we can't actually authenticate without user interaction (opening a browser).
        // For this agent, we will assume we can't fully automate this without a token.
        // We will just log the draft creation for now, or setup a placeholder OAuth2 client.
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            this.auth = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/oauth2callback');
        }
    }
    async createDraft(params) {
        console.log("💌 [GmailService] Creating mock draft...");
        console.log(`To: ${params.to}`);
        console.log(`Subject: ${params.subject}`);
        console.log(`Body: ${params.body}`);
        // To actually create a draft, we would need:
        // this.auth.setCredentials({ refresh_token: ... });
        // const gmail = google.gmail({ version: 'v1', auth: this.auth });
        // await gmail.users.drafts.create({ ... });
        // Since we don't have a token, we stop here.
        return Promise.resolve();
    }
}
exports.GmailService = GmailService;
