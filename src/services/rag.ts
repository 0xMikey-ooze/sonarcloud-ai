import lunr from 'lunr';
import * as fs from 'fs';
import * as path from 'path';

interface HistoryItem {
    id: string;
    issue: string;
    solution: string;
}

export class RagService {
    private index: lunr.Index;
    private documents: HistoryItem[];

    constructor() {
        // Load documents
        const dataPath = path.join(__dirname, '../data/history.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        this.documents = JSON.parse(rawData);

        // Build Index
        const docs = this.documents;
        this.index = lunr(function () {
            this.ref('id');
            this.field('issue');
            this.field('solution');

            docs.forEach(doc => {
                this.add(doc);
            });
        });
    }

    search(query: string): string[] {
        const results = this.index.search(query);

        // valid results with some score threshold logic if needed, 
        // but for now just return top 3 matches
        return results.slice(0, 3).map(result => {
            const doc = this.documents.find(d => d.id === result.ref);
            return doc ? `Issue: ${doc.issue}\nSolution: ${doc.solution}` : '';
        }).filter(s => s !== '');
    }
}
