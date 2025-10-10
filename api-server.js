/**
 * API Server for SIP Management
 * ==============================
 * REST API endpoints to create/list/delete SIP trunks and dispatch rules
 */

import 'dotenv/config';
import express from 'express';
import { SipClient } from 'livekit-server-sdk';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(express.json());

// Initialize SIP Client
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const sipClient = new SipClient(LIVEKIT_URL, API_KEY, API_SECRET);

/**
 * POST /api/sip/trunk
 * Create SIP Inbound Trunk
 */
app.post('/api/sip/trunk', async (req, res) => {
  try {
    const { name, phoneNumbers, metadata, krispEnabled } = req.body;

    if (!name || !phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        error: 'Missing required fields: name, phoneNumbers (array)',
      });
    }

    // Check if phone numbers are already in use
    const existingTrunks = await sipClient.listSipInboundTrunk();
    const usedNumbers = existingTrunks.flatMap((t) => t.numbers);
    const duplicates = phoneNumbers.filter((num) => usedNumbers.includes(num));

    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Phone number(s) already in use: ${duplicates.join(', ')}`,
        conflictingNumbers: duplicates,
        existingTrunks: existingTrunks
          .filter((t) => t.numbers.some((n) => duplicates.includes(n)))
          .map((t) => ({
            id: t.sipTrunkId,
            name: t.name,
            numbers: t.numbers,
          })),
      });
    }

    const trunk = await sipClient.createSipInboundTrunk(name, phoneNumbers, {
      metadata: metadata || JSON.stringify({ createdAt: new Date().toISOString() }),
      krispEnabled: krispEnabled !== undefined ? krispEnabled : true,
    });

    res.json({
      success: true,
      trunk: {
        id: trunk.sipTrunkId,
        name: trunk.name,
        numbers: trunk.numbers,
        metadata: trunk.metadata,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sip/dispatch-rule
 * Create SIP Dispatch Rule
 */
app.post('/api/sip/dispatch-rule', async (req, res) => {
  try {
    const { trunkId, name, type, roomPrefix, roomName, pin } = req.body;

    if (!trunkId || !type) {
      return res.status(400).json({
        error: 'Missing required fields: trunkId, type (individual or direct)',
      });
    }

    let rule;
    if (type === 'individual') {
      if (!roomPrefix) {
        return res.status(400).json({
          error: 'roomPrefix is required for individual dispatch rule',
        });
      }
      rule = {
        type: 'individual',
        roomPrefix: roomPrefix,
        pin: pin || '',
      };
    } else if (type === 'direct') {
      if (!roomName) {
        return res.status(400).json({
          error: 'roomName is required for direct dispatch rule',
        });
      }
      rule = {
        type: 'direct',
        roomName: roomName,
        pin: pin || '',
      };
    } else {
      return res.status(400).json({
        error: 'type must be either "individual" or "direct"',
      });
    }

    const dispatchRule = await sipClient.createSipDispatchRule(rule, {
      name: name || `Dispatch Rule - ${new Date().toISOString()}`,
      trunkIds: [trunkId],
      metadata: JSON.stringify({
        createdAt: new Date().toISOString(),
        type: type,
      }),
    });

    res.json({
      success: true,
      dispatchRule: {
        id: dispatchRule.sipDispatchRuleId,
        name: dispatchRule.name,
        trunkIds: dispatchRule.trunkIds,
        metadata: dispatchRule.metadata,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sip/trunks
 * List all SIP trunks
 */
app.get('/api/sip/trunks', async (req, res) => {
  try {
    const trunks = await sipClient.listSipInboundTrunk();
    res.json({
      success: true,
      count: trunks.length,
      trunks: trunks.map((t) => ({
        id: t.sipTrunkId,
        name: t.name,
        numbers: t.numbers,
        metadata: t.metadata,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sip/dispatch-rules
 * List all dispatch rules
 */
app.get('/api/sip/dispatch-rules', async (req, res) => {
  try {
    const rules = await sipClient.listSipDispatchRule();
    res.json({
      success: true,
      count: rules.length,
      dispatchRules: rules.map((r) => ({
        id: r.sipDispatchRuleId,
        name: r.name,
        trunkIds: r.trunkIds,
        metadata: r.metadata,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/sip/trunk/:trunkId
 * Delete SIP trunk
 */
app.delete('/api/sip/trunk/:trunkId', async (req, res) => {
  try {
    const { trunkId } = req.params;
    await sipClient.deleteSipTrunk(trunkId);
    res.json({
      success: true,
      message: `Trunk ${trunkId} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/sip/dispatch-rule/:ruleId
 * Delete dispatch rule
 */
app.delete('/api/sip/dispatch-rule/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    await sipClient.deleteSipDispatchRule(ruleId);
    res.json({
      success: true,
      message: `Dispatch rule ${ruleId} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    message: 'LiveKit SIP Management API',
    endpoints: {
      'POST /api/sip/trunk': 'Create SIP inbound trunk',
      'POST /api/sip/dispatch-rule': 'Create dispatch rule',
      'GET /api/sip/trunks': 'List all trunks',
      'GET /api/sip/dispatch-rules': 'List all dispatch rules',
      'DELETE /api/sip/trunk/:trunkId': 'Delete trunk',
      'DELETE /api/sip/dispatch-rule/:ruleId': 'Delete dispatch rule',
    },
    examples: {
      createTrunk: {
        method: 'POST',
        url: '/api/sip/trunk',
        body: {
          name: 'My Agent Trunk',
          phoneNumbers: ['+12345678900'],
          metadata: 'optional metadata',
          krispEnabled: true,
        },
      },
      createDispatchRule: {
        method: 'POST',
        url: '/api/sip/dispatch-rule',
        body: {
          trunkId: 'ST_xxxxx',
          name: 'Agent Dispatch',
          type: 'individual',
          roomPrefix: 'call',
          pin: '',
        },
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SIP Management API Server running on port ${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST   http://localhost:${PORT}/api/sip/trunk`);
  console.log(`   POST   http://localhost:${PORT}/api/sip/dispatch-rule`);
  console.log(`   GET    http://localhost:${PORT}/api/sip/trunks`);
  console.log(`   GET    http://localhost:${PORT}/api/sip/dispatch-rules`);
  console.log(`   DELETE http://localhost:${PORT}/api/sip/trunk/:trunkId`);
  console.log(`   DELETE http://localhost:${PORT}/api/sip/dispatch-rule/:ruleId`);
  console.log(`\n💡 Visit http://localhost:${PORT} for API documentation\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down API server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down API server...');
  process.exit(0);
});
