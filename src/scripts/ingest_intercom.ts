import * as fs from 'fs';
import * as path from 'path';
import { IntercomService } from '../services/intercom';

// This script simulates fetching all closed conversations from Intercom
// and appending them to our history.json for RAG.

const HISTORY_FILE = path.join(__dirname, '../data/history.json');

async function ingestIntercomData() {
    console.log("🔄 Connecting to Intercom...");
    // verification of mocked service
    const intercom = new IntercomService();

    // In a real scenario, we would paginate through: client.conversations.list({ state: 'closed' })
    console.log("📥 Fetching closed conversations...");

    // Mocking the data we "fetched"
    const newHistoryItems = [
        {
            id: "intercom_101",
            issue: "How do I change the bell schedule for exam week?",
            solution: "You can create a 'Special Schedule' in the Calendar tab. Go to Calendar > Special Schedules > Add New, set the dates, and define the bell times."
        },
        {
            id: "intercom_102",
            issue: "The mobile app keeps logging me out.",
            solution: "We released a patch for this in v2.4.1. Please update the SonarCloud app from the App Store or Play Store."
        },
        {
            id: "intercom_103",
            issue: "Can we integrate SonarCloud with PowerSchool?",
            solution: "Yes, we support SIS sync with PowerSchool via OneRoster API. Please reach out to your account manager to enable this feature."
        }
    ];

    console.log(`✅ Found ${newHistoryItems.length} new closed conversations suitable for knowledge base.`);

    // Read existing
    let existingHistory = [];
    if (fs.existsSync(HISTORY_FILE)) {
        existingHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }

    // Append (avoiding duplicates by ID ideally, simplified here)
    const updatedHistory = [...existingHistory, ...newHistoryItems];

    // Write back
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
    console.log(`💾 Saved! History DB now has ${updatedHistory.length} items.`);
}

ingestIntercomData().catch(console.error);
