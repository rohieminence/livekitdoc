# LiveKit SIP Setup for Agent/Bot Calling (Node.js)

This guide shows you how to programmatically create SIP trunks and dispatch rules in LiveKit for calling your agent/bot using **Node.js**.

## Overview

**Answer to your question:** You use **LiveKit's REST APIs** (not webhooks) to create SIP trunks and dispatch rules. Webhooks are used differently - they notify your server when events happen, but APIs are what you use to configure the SIP infrastructure.

## Prerequisites

1. **LiveKit Account**: You need a LiveKit Cloud account or self-hosted LiveKit server
2. **API Credentials**: Get your API Key and API Secret from LiveKit dashboard
3. **SIP Provider**: You need a phone number from a SIP provider (Twilio, Telnyx, etc.)
4. **Node.js**: Version 18 or higher

## Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

## Quick Start

### Step 1: Get Your Credentials

1. Go to your LiveKit dashboard
2. Navigate to **Settings** → **Keys**
3. Copy your:
   - LiveKit URL (e.g., `https://your-project.livekit.cloud`)
   - API Key
   - API Secret

### Step 2: Get a Phone Number

You need a phone number from a SIP provider. Popular options:
- **Twilio**: Get a phone number and configure it to forward SIP calls to LiveKit
- **Telnyx**: Similar setup
- **Other SIP providers**: Most work with LiveKit

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
LIVEKIT_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
PHONE_NUMBERS=+12345678900
```

### Step 4: Run the Setup Script

Edit [livekit-sip-setup.js](livekit-sip-setup.js) and update the configuration in the `main()` function, then run:

```bash
# Create SIP trunk and dispatch rule
npm start

# Or run directly
node livekit-sip-setup.js
```

### Step 5: List Existing Resources

```bash
# List all SIP trunks and dispatch rules
npm run list
```

## What Happens When You Run This

1. **Creates SIP Inbound Trunk**: This is the "gateway" that receives phone calls
2. **Creates Dispatch Rule**: This tells LiveKit what to do when a call comes in
3. **Result**: When someone calls your number, LiveKit creates a room with prefix `agent-call-<unique-id>` and connects the caller to it

## How This Works with Your Agent/Bot

```
Phone Call → SIP Provider → LiveKit SIP Trunk → Dispatch Rule → Room Created
                                                                      ↓
                                                           Your Agent Joins Room
```

Your agent needs to:
1. Listen for room creation events (via webhook or polling)
2. Join the room when a call comes in
3. Process audio from the caller
4. Respond with audio

## Using the Webhook Server

The webhook server receives events from LiveKit and can trigger your agent to join calls automatically.

### Start the Webhook Server

```bash
npm run webhook
```

### Expose to Internet (for development)

If running locally, use ngrok to expose your server:

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Configure in LiveKit Dashboard

1. Go to your LiveKit dashboard
2. Navigate to **Settings** → **Webhooks**
3. Add webhook URL: `https://your-ngrok-url/livekit/webhook`
4. Save the configuration

### Webhook Events

The webhook server handles these events:
- `room_started`: Called when a room is created (call incoming)
- `participant_joined`: Called when someone joins the room
- `participant_left`: Called when someone leaves
- `room_finished`: Called when the call ends
- `track_published`: Called when audio/video tracks are published

## API Endpoints Used

The script uses these LiveKit SIP APIs:

| API | Purpose |
|-----|---------|
| `createSipInboundTrunk()` | Creates trunk for receiving calls |
| `createSipDispatchRule()` | Routes calls to rooms |
| `listSipInboundTrunk()` | Lists existing trunks |
| `listSipDispatchRule()` | Lists existing rules |
| `deleteSipTrunk()` | Deletes a trunk |
| `deleteSipDispatchRule()` | Deletes a rule |

## Example: Complete Agent Flow

1. **Setup (one-time)**: Run `npm start` to create trunk and dispatch rule
2. **Webhook Setup**: Start webhook server with `npm run webhook` and configure URL in LiveKit
3. **Call Incoming**:
   - User calls your phone number
   - LiveKit creates room `agent-call-abc123`
   - LiveKit sends webhook to your server
4. **Agent Responds**:
   - Your webhook receives event
   - Your agent code joins room `agent-call-abc123`
   - Agent processes audio and responds

## Functions in the Script

### `setupSipForAgent(config)`
Creates SIP trunk and dispatch rule for your agent with individual rooms per call.

**Parameters:**
- `livekitUrl`: Your LiveKit server URL
- `apiKey`: Your API key
- `apiSecret`: Your API secret
- `phoneNumbers`: Array of phone numbers
- `trunkName`: Name for the trunk (optional)
- `roomPrefix`: Prefix for created rooms (optional)

**Returns:** Object with `trunkId`, `dispatchRuleId`, `phoneNumbers`, `roomPrefix`

### `setupSipWithPin(config)`
Creates SIP setup with PIN protection. Callers must enter a PIN to access the room.

**Parameters:** Same as `setupSipForAgent` plus:
- `pin`: PIN code that callers must enter

### `setupDirectDispatch(config)`
Creates a setup where all calls go to the same room (instead of individual rooms).

**Parameters:** Same as `setupSipForAgent` but uses:
- `roomName`: Name of the single room all calls go to

### `listExistingSipResources(url, key, secret)`
Lists all existing SIP trunks and dispatch rules.

### `deleteSipResources(url, key, secret, { trunkId, dispatchRuleId })`
Deletes specific trunk or dispatch rule by ID.

## Advanced Configuration Examples

### Multiple Phone Numbers

```javascript
const result = await setupSipForAgent({
  livekitUrl: LIVEKIT_URL,
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  phoneNumbers: ['+12345678900', '+12345678901', '+12345678902'],
});
```

### PIN Protection

```javascript
const result = await setupSipWithPin({
  livekitUrl: LIVEKIT_URL,
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  phoneNumbers: ['+12345678900'],
  pin: '1234', // Callers must enter this PIN
});
```

### Direct Dispatch (All Calls to Same Room)

```javascript
const result = await setupDirectDispatch({
  livekitUrl: LIVEKIT_URL,
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  phoneNumbers: ['+12345678900'],
  roomName: 'main-support-room', // All calls go here
});
```

### Delete Resources

```javascript
await deleteSipResources(LIVEKIT_URL, API_KEY, API_SECRET, {
  trunkId: 'TR_xxxxx',
  dispatchRuleId: 'DR_xxxxx',
});
```

## Files Structure

```
.
├── livekit-sip-setup.js      # Main setup script with all functions
├── webhook-server.js          # Webhook server to receive LiveKit events
├── package.json               # Node.js dependencies
├── .env.example               # Environment variables template
├── .env                       # Your actual credentials (create this)
├── examples/
│   └── list-resources.js     # Script to list all resources
└── README.md                  # This file
```

## Webhook Server Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/livekit/webhook` | POST | Receives webhook events from LiveKit |
| `/health` | GET | Health check endpoint |
| `/` | GET | Server information |

## Example Webhook Event

When a call comes in, your webhook receives:

```json
{
  "event": "room_started",
  "room": {
    "name": "agent-call-abc123",
    "creationTime": 1234567890
  },
  "createdAt": 1234567890
}
```

When a SIP participant joins:

```json
{
  "event": "participant_joined",
  "room": {
    "name": "agent-call-abc123"
  },
  "participant": {
    "identity": "sip_caller_123",
    "kind": "sip",
    "attributes": {
      "phoneNumber": "+12345678900"
    }
  }
}
```

## Troubleshooting

**Error: "Permission denied"**
- Make sure your API key has SIP admin permissions

**Error: "Phone number already in use"**
- Delete existing trunk using `deleteSipResources()`
- Or use `npm run list` to see existing resources

**Calls not routing to agent**
- Check dispatch rule is created correctly
- Verify room prefix matches what your agent is listening for
- Check webhook is configured and receiving events
- Test webhook with `curl -X POST https://your-webhook-url/health`

**Webhook not receiving events**
- Verify webhook URL is publicly accessible
- Check LiveKit dashboard webhook configuration
- Ensure webhook URL uses HTTPS (required in production)
- Check server logs for incoming requests

**Module errors**
- Make sure you're using Node.js 18+
- Run `npm install` to install all dependencies
- Check that `"type": "module"` is in package.json

## Next Steps

1. ✅ Run `npm start` to create SIP infrastructure
2. 📱 Configure your SIP provider to forward calls to LiveKit
3. 🌐 Start webhook server with `npm run webhook`
4. 🔌 Expose webhook server and configure URL in LiveKit dashboard
5. 🤖 Build your agent to join rooms when webhook events arrive
6. 🔊 Implement audio processing in your agent

## Resources

- [LiveKit SIP Documentation](https://docs.livekit.io/sip/)
- [LiveKit Agents Telephony Guide](https://docs.livekit.io/agents/start/telephony/)
- [LiveKit Node.js SDK](https://docs.livekit.io/reference/server-sdk-js/)
- [LiveKit Webhook Documentation](https://docs.livekit.io/realtime/server/webhooks/)
