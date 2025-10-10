/**
 * List all SIP resources
 * ======================
 * Simple script to list all SIP trunks and dispatch rules
 */

import 'dotenv/config';
import { listExistingSipResources } from '../livekit-sip-setup.js';

// Configuration
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'https://your-project.livekit.cloud';
const API_KEY = process.env.LIVEKIT_API_KEY || 'your-api-key';
const API_SECRET = process.env.LIVEKIT_API_SECRET || 'your-api-secret';

async function main() {
  console.log('📋 Listing LiveKit SIP Resources...\n');

  try {
    await listExistingSipResources(LIVEKIT_URL, API_KEY, API_SECRET);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
