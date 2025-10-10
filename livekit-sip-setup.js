 
import 'dotenv/config';
import { SipClient } from 'livekit-server-sdk';

/**
 * Create SIP trunk and dispatch rule for agent/bot calling.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.livekitUrl - Your LiveKit server URL (e.g., 'https://your-project.livekit.cloud')
 * @param {string} config.apiKey - Your LiveKit API key
 * @param {string} config.apiSecret - Your LiveKit API secret
 * @param {string[]} config.phoneNumbers - List of phone numbers for the trunk (e.g., ['+12345678900'])
 * @param {string} [config.trunkName='Agent Inbound Trunk'] - Name for the SIP trunk
 * @param {string} [config.roomPrefix='agent-call-'] - Prefix for room names when calls come in
 *
 * @returns {Promise<Object>} Contains trunk_id and dispatch_rule_id
 */
async function setupSipForAgent({
  livekitUrl,
  apiKey,
  apiSecret,
  phoneNumbers,
  trunkName = 'Agent Inbound Trunk',
  roomPrefix = 'agent-call-',
}) {
  // Initialize LiveKit SIP client
  const sipClient = new SipClient(livekitUrl, apiKey, apiSecret);

  console.log('🔧 Setting up LiveKit SIP for agent calling...');

  try {
    // Step 1: Create SIP Inbound Trunk
    console.log(`\n📞 Creating SIP Inbound Trunk: ${trunkName}`);

    const inboundTrunk = await sipClient.createSipInboundTrunk(
      trunkName,
      phoneNumbers,
      {
        metadata: JSON.stringify({
          purpose: 'agent-calling',
          createdAt: new Date().toISOString(),
        }),
        // Enable Krisp noise cancellation for better audio quality
        krispEnabled: true,
      }
    );

    const trunkId = inboundTrunk.sipTrunkId;
    console.log('✅ Trunk created successfully!');
    console.log(`   - Trunk ID: ${trunkId}`);
    console.log(`   - Phone Numbers: ${phoneNumbers.join(', ')}`);

    // Step 2: Create Dispatch Rule
    console.log(`\n📋 Creating Dispatch Rule for agent routing...`);

    const dispatchRule = await sipClient.createSipDispatchRule(
      {
        type: 'individual',
        roomPrefix: roomPrefix,
        pin: '', // Optional PIN for call authentication
      },
      {
        name: `${trunkName} - Agent Dispatch`,
        trunkIds: [trunkId],
        metadata: JSON.stringify({
          purpose: 'route-to-agent',
          roomPrefix: roomPrefix,
        }),
      }
    );

    const ruleId = dispatchRule.sipDispatchRuleId;
    console.log('✅ Dispatch rule created successfully!');
    console.log(`   - Rule ID: ${ruleId}`);
    console.log(`   - Room Prefix: ${roomPrefix}`);

    console.log('\n🎉 SIP setup complete!');
    console.log(
      `\nℹ️  When someone calls ${phoneNumbers[0]}, they'll be connected to room: ${roomPrefix}<unique-id>`
    );

    return {
      trunkId: trunkId,
      dispatchRuleId: ruleId,
      phoneNumbers: phoneNumbers,
      roomPrefix: roomPrefix,
    };
  } catch (error) {
    console.error('❌ Error setting up SIP:', error.message);
    throw error;
  }
}

/**
 * List all existing SIP trunks and dispatch rules.
 */
async function listExistingSipResources(livekitUrl, apiKey, apiSecret) {
  const sipClient = new SipClient(livekitUrl, apiKey, apiSecret);

  try {
    console.log('\n📋 Existing SIP Inbound Trunks:');
    const trunks = await sipClient.listSipInboundTrunk();

    if (trunks.length === 0) {
      console.log('   No trunks found');
    } else {
      for (const trunk of trunks) {
        console.log(`   - ${trunk.name} (ID: ${trunk.sipTrunkId})`);
        console.log(`     Numbers: ${trunk.numbers.join(', ')}`);
      }
    }

    console.log('\n📋 Existing Dispatch Rules:');
    const rules = await sipClient.listSipDispatchRule();

    if (rules.length === 0) {
      console.log('   No dispatch rules found');
    } else {
      for (const rule of rules) {
        console.log(`   - ${rule.name || 'Unnamed'} (ID: ${rule.sipDispatchRuleId})`);
        if (rule.trunkIds && rule.trunkIds.length > 0) {
          console.log(`     Trunk IDs: ${rule.trunkIds.join(', ')}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error listing SIP resources:', error.message);
    throw error;
  }
}

/**
 * Delete specific SIP trunk or dispatch rule.
 */
async function deleteSipResources(
  livekitUrl,
  apiKey,
  apiSecret,
  { trunkId, dispatchRuleId }
) {
  const sipClient = new SipClient(livekitUrl, apiKey, apiSecret);

  try {
    if (dispatchRuleId) {
      console.log(`🗑️  Deleting dispatch rule: ${dispatchRuleId}`);
      await sipClient.deleteSipDispatchRule(dispatchRuleId);
      console.log('✅ Dispatch rule deleted');
    }

    if (trunkId) {
      console.log(`🗑️  Deleting trunk: ${trunkId}`);
      await sipClient.deleteSipTrunk(trunkId);
      console.log('✅ Trunk deleted');
    }
  } catch (error) {
    console.error('❌ Error deleting SIP resources:', error.message);
    throw error;
  }
}

/**
 * Create a dispatch rule with PIN protection
 */
async function setupSipWithPin({
  livekitUrl,
  apiKey,
  apiSecret,
  phoneNumbers,
  trunkName = 'Secure Agent Trunk',
  roomPrefix = 'agent-call-',
  pin = '1234',
}) {
  const sipClient = new SipClient(livekitUrl, apiKey, apiSecret);

  console.log('🔧 Setting up LiveKit SIP with PIN protection...');

  try {
    // Create trunk
    const inboundTrunk = await sipClient.createSipInboundTrunk(
      trunkName,
      phoneNumbers
    );

    // Create dispatch rule with PIN
    const dispatchRule = await sipClient.createSipDispatchRule(
      {
        type: 'individual',
        roomPrefix: roomPrefix,
        pin: pin, // Callers must enter this PIN
      },
      {
        name: `${trunkName} - Secure Dispatch`,
        trunkIds: [inboundTrunk.sipTrunkId],
      }
    );

    console.log('✅ Secure SIP setup complete!');
    console.log(`   - PIN: ${pin}`);

    return {
      trunkId: inboundTrunk.sipTrunkId,
      dispatchRuleId: dispatchRule.sipDispatchRuleId,
      pin: pin,
    };
  } catch (error) {
    console.error('❌ Error setting up SIP with PIN:', error.message);
    throw error;
  }
}

/**
 * Create a direct dispatch rule (all callers go to the same room)
 */
async function setupDirectDispatch({
  livekitUrl,
  apiKey,
  apiSecret,
  phoneNumbers,
  trunkName = 'Direct Agent Trunk',
  roomName = 'agent-support-room',
}) {
  const sipClient = new SipClient(livekitUrl, apiKey, apiSecret);

  console.log('🔧 Setting up LiveKit SIP with direct dispatch...');

  try {
    // Create trunk
    const inboundTrunk = await sipClient.createSipInboundTrunk(
      trunkName,
      phoneNumbers
    );

    // Create direct dispatch rule (all calls go to the same room)
    const dispatchRule = await sipClient.createSipDispatchRule(
      {
        type: 'direct',
        roomName: roomName,
        pin: '', // Optional PIN
      },
      {
        name: `${trunkName} - Direct Dispatch`,
        trunkIds: [inboundTrunk.sipTrunkId],
      }
    );

    console.log('✅ Direct dispatch setup complete!');
    console.log(`   - All calls will go to room: ${roomName}`);

    return {
      trunkId: inboundTrunk.sipTrunkId,
      dispatchRuleId: dispatchRule.sipDispatchRuleId,
      roomName: roomName,
    };
  } catch (error) {
    console.error('❌ Error setting up direct dispatch:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  // Configuration from environment variables
  const LIVEKIT_URL = process.env.LIVEKIT_URL;
  console.log(LIVEKIT_URL,'LIVEKIT_URLLIVEKIT_URL')
  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET = process.env.LIVEKIT_API_SECRET;
  const PHONE_NUMBERS = process.env.PHONE_NUMBERS ? process.env.PHONE_NUMBERS.split(',') : [];
  const TRUNK_NAME = process.env.TRUNK_NAME || 'My Agent Trunk';
  const ROOM_PREFIX = process.env.ROOM_PREFIX || 'call';

  if (!LIVEKIT_URL || !API_KEY || !API_SECRET || PHONE_NUMBERS.length === 0) {
    console.error('❌ Error: Missing required environment variables');
    console.error('   Please set: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, PHONE_NUMBERS');
    process.exit(1);
  }

  try {
    // Option 1: Create SIP trunk and dispatch rule (Individual rooms)
    const result = await setupSipForAgent({
      livekitUrl: LIVEKIT_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      phoneNumbers: PHONE_NUMBERS,
      trunkName: TRUNK_NAME,
      roomPrefix: ROOM_PREFIX,
    });

    console.log('\n📝 Save these IDs for later:');
    console.log(`   Trunk ID: ${result.trunkId}`);
    console.log(`   Dispatch Rule ID: ${result.dispatchRuleId}`);

    // Option 2: List all resources (uncomment to use)
    // await listExistingSipResources(LIVEKIT_URL, API_KEY, API_SECRET);

    // Option 3: Setup with PIN protection (uncomment to use)
    // await setupSipWithPin({
    //   livekitUrl: LIVEKIT_URL,
    //   apiKey: API_KEY,
    //   apiSecret: API_SECRET,
    //   phoneNumbers: PHONE_NUMBERS,
    //   pin: '1234',
    // });

    // Option 4: Setup direct dispatch (all calls to same room) (uncomment to use)
    // await setupDirectDispatch({
    //   livekitUrl: LIVEKIT_URL,
    //   apiKey: API_KEY,
    //   apiSecret: API_SECRET,
    //   phoneNumbers: PHONE_NUMBERS,
    //   roomName: 'main-support-room',
    // });

    // Option 5: Delete resources (uncomment to use)
    // await deleteSipResources(LIVEKIT_URL, API_KEY, API_SECRET, {
    //   trunkId: 'TR_xxxxx',
    //   dispatchRuleId: 'DR_xxxxx',
    // });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions for use as a module
export {
  setupSipForAgent,
  listExistingSipResources,
  deleteSipResources,
  setupSipWithPin,
  setupDirectDispatch,
};
