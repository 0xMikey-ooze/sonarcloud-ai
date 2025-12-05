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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagService = void 0;
const lunr_1 = __importDefault(require("lunr"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RagService {
    constructor() {
        // Load documents
        const dataPath = path.join(__dirname, '../data/history.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        this.documents = JSON.parse(rawData);
        // Build Index
        const docs = this.documents;
        this.index = (0, lunr_1.default)(function () {
            this.ref('id');
            this.field('issue');
            this.field('solution');
            docs.forEach(doc => {
                this.add(doc);
            });
        });
    }
    search(query) {
        const results = this.index.search(query);
        // valid results with some score threshold logic if needed, 
        // but for now just return top 3 matches
        return results.slice(0, 3).map(result => {
            const doc = this.documents.find(d => d.id === result.ref);
            return doc ? `Issue: ${doc.issue}\nSolution: ${doc.solution}` : '';
        }).filter(s => s !== '');
    }
}
exports.RagService = RagService;
