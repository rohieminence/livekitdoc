# LiveKit SIP Management API Documentation

## Table of Contents
- [Overview](#overview)
- [Pricing & Costs](#pricing--costs)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
  - [Create SIP Trunk](#1-create-sip-trunk)
  - [Create Dispatch Rule](#2-create-dispatch-rule)
  - [List All SIP Trunks](#3-list-all-sip-trunks)
  - [List All Dispatch Rules](#4-list-all-dispatch-rules)
  - [Delete SIP Trunk](#5-delete-sip-trunk)
  - [Delete Dispatch Rule](#6-delete-dispatch-rule)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

The LiveKit SIP Management API provides a RESTful interface for managing SIP (Session Initiation Protocol) trunks and dispatch rules. This API enables you to:

- Create and manage SIP inbound trunks for telephony integration
- Configure dispatch rules to route incoming calls to LiveKit rooms
- List and delete existing SIP resources
- Implement both individual and direct call routing strategies

**Version:** 1.0.0
**Protocol:** REST
**Content-Type:** `application/json`

---

## Pricing & Costs

### LiveKit SIP Pricing

LiveKit charges for SIP services based on usage. Below are the typical costs:

#### SIP Trunk Costs
- **Setup Fee**: Free (no charge for creating SIP trunks)
- **Monthly Fee**: Free (no recurring charges for inactive trunks)
- **Phone Number Rental**: Varies by provider (typically $1-5/month per number)
  - US/Canada numbers: ~$1-2/month
  - International numbers: Varies by country ($2-10/month)

#### SIP Call Costs
- **Inbound Calls**: $0.0085/minute (~$0.51/hour)
- **Outbound Calls**: $0.012/minute (~$0.72/hour)
- **Toll-Free Inbound**: $0.022/minute (~$1.32/hour)

#### LiveKit Room Costs
When SIP calls are routed to LiveKit rooms:
- **Participant Minutes**: $0.008/participant-minute (~$0.48/hour)
- **Egress (Recording/Streaming)**: $0.006/minute (~$0.36/hour)
- **Ingress (Broadcasting)**: $0.006/minute (~$0.36/hour)

#### Feature Costs
- **Krisp Noise Cancellation**: Included (no additional cost when `krispEnabled: true`)
- **PIN Protection**: Included (no additional cost)
- **Dispatch Rules**: Free (unlimited rules)

#### Cost Calculation Examples

**Example 1: Customer Support Line (Individual Routing)**
- 100 incoming calls/day
- Average 5 minutes per call
- With Krisp enabled
- US phone number

Monthly costs:
- Phone number rental: $1.50/month
- SIP inbound minutes: 100 calls × 5 min × 30 days × $0.0085 = $127.50
- Room participant minutes: 15,000 min × $0.008 = $120
- **Total: ~$249/month**

**Example 2: Conference Line (Direct Routing)**
- 1 shared conference room
- 20 participants joining via phone
- 2-hour daily meetings (30 days)
- Toll-free number

Monthly costs:
- Phone number rental: $3/month
- SIP inbound minutes: 20 × 120 min × 30 days × $0.022 = $1,584
- Room participant minutes: 20 × 120 min × 30 days × $0.008 = $576
- **Total: ~$2,163/month**

#### Free Tier
LiveKit offers a free tier for development and testing:
- 10,000 participant-minutes/month
- Limited to development/testing use
- No SIP minutes included in free tier

**Note**: Prices are approximate and subject to change. Check [LiveKit Pricing](https://livekit.io/pricing) for current rates.

---

## Getting Started

### Prerequisites

1. **LiveKit Account**: You need a LiveKit account with API credentials
2. **Environment Variables**: Configure the following in your `.env` file:
   ```bash
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   API_PORT=4000
   ```

### Installation

```bash
# Install dependencies
npm install

# Start the API server
npm run api
```

The server will start on `http://localhost:4000` (or your configured `API_PORT`).

---

## Authentication

The API uses LiveKit server-side authentication with API Key and Secret configured in the server environment. No additional authentication headers are required in API requests as the server handles authentication internally.

**Security Note**: Keep your `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` secure and never expose them in client-side code.

---

## Base URL

```
http://localhost:4000
```

For production deployments, replace with your production domain.

---

## API Endpoints

### 1. Create SIP Trunk

Creates a new SIP inbound trunk for handling incoming phone calls.

**Endpoint:** `POST /api/sip/trunk`

#### Request Body

| Field | Type | Required | Available Options | Default | Description |
|-------|------|----------|-------------------|---------|-------------|
| `name` | string | Yes | Any string | - | Unique identifier name for the SIP trunk (e.g., "Customer Support Trunk") |
| `phoneNumbers` | string[] | Yes | E.164 format numbers | - | Array of phone numbers (e.g., `["+12345678900"]`, `["+442071234567"]`). Must start with `+` and country code |
| `metadata` | string | No | Any string | `"{\"createdAt\":\"[timestamp]\"}"` | Optional metadata for storing additional trunk information. Typically JSON-encoded |
| `krispEnabled` | boolean | No | `true`, `false` | `true` | Enable/disable Krisp AI noise cancellation. **Cost**: Free (included) |

#### Field Details & Available Options

**`name`** (string, required)
- **Purpose**: Identifies the trunk in LiveKit dashboard and API responses
- **Options**: Any alphanumeric string, hyphens, underscores allowed
- **Examples**: `"Customer-Support"`, `"Sales_Line_001"`, `"Main Trunk"`
- **Best Practice**: Use descriptive names for easy identification

**`phoneNumbers`** (array, required)
- **Purpose**: Phone numbers that will receive incoming calls
- **Format**: E.164 international format
- **Options**: Any valid phone number with country code
- **Examples**:
  - US/Canada: `["+1234567890"]`, `["+18005551234"]`
  - UK: `["+442071234567"]`
  - Germany: `["+4930123456"]`
  - Multiple: `["+12345678900", "+12345678901"]`
- **Cost Impact**: Each number may incur rental fees ($1-10/month depending on country)
- **Validation**: Must start with `+`, followed by country code and number

**`metadata`** (string, optional)
- **Purpose**: Store custom data about the trunk
- **Options**: Any string (recommend JSON format for structured data)
- **Default**: Auto-generated with creation timestamp
- **Examples**:
  - `"{\"department\":\"support\",\"region\":\"US-West\"}"`
  - `"{\"owner\":\"john@company.com\",\"costCenter\":\"CC-1234\"}"`
  - `"Production trunk for Q4 2025"`
- **Max Length**: 4096 characters

**`krispEnabled`** (boolean, optional)
- **Purpose**: Enable AI-powered noise cancellation for clearer audio
- **Available Options**:
  - `true` - Enable Krisp (recommended for customer-facing calls)
  - `false` - Disable Krisp (use for controlled environments)
- **Default**: `true`
- **Cost**: Free (no additional charge)
- **Impact**: Reduces background noise like typing, traffic, wind
- **Use Cases**:
  - `true`: Customer support, sales calls, remote workers
  - `false`: Office-based calls, controlled environments

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "trunk": {
    "id": "ST_MdFGqqPRBLQ7",
    "name": "Customer Support Trunk",
    "numbers": ["+12345678900"],
    "metadata": "{\"createdAt\":\"2025-10-10T10:30:00Z\"}"
  }
}
```

**Error (409 Conflict) - Phone number already in use:**
```json
{
  "success": false,
  "error": "Phone number(s) already in use: +12345678900",
  "conflictingNumbers": ["+12345678900"],
  "existingTrunks": [
    {
      "id": "ST_ABC123",
      "name": "Existing Trunk",
      "numbers": ["+12345678900"]
    }
  ]
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing required fields: name, phoneNumbers (array)"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Trunk",
    "phoneNumbers": ["+12345678900"],
    "metadata": "{\"department\":\"support\",\"region\":\"us-west\"}",
    "krispEnabled": true
  }'
```

#### Usage Notes

- Phone numbers must be unique across all trunks
- The API automatically checks for duplicate phone numbers before creation
- Phone numbers must be in E.164 format (e.g., +1 for US, +44 for UK)
- Save the returned `trunk.id` for creating dispatch rules

---

### 2. Create Dispatch Rule

Creates a dispatch rule that determines how incoming calls are routed to LiveKit rooms.

**Endpoint:** `POST /api/sip/dispatch-rule`

#### Request Body

| Field | Type | Required | Available Options | Default | Description |
|-------|------|----------|-------------------|---------|-------------|
| `trunkId` | string | Yes | Valid trunk ID (e.g., `"ST_xxxxx"`) | - | The ID of the SIP trunk this rule applies to. Get from Create Trunk response |
| `name` | string | No | Any string | `"Dispatch Rule - [timestamp]"` | Human-readable name for the dispatch rule |
| `type` | string | Yes | `"individual"`, `"direct"` | - | **Required**. Routing strategy (see details below) |
| `roomPrefix` | string | Conditional* | Any string (alphanumeric, hyphens) | - | *Required if `type: "individual"`. Prefix for room names (e.g., `"call"` → `"call-abc123"`) |
| `roomName` | string | Conditional* | Any string (alphanumeric, hyphens) | - | *Required if `type: "direct"`. Exact room name for all calls (e.g., `"support-room"`) |
| `pin` | string | No | `""` (no PIN), or `"1234"` (4-6 digits recommended) | `""` | Optional PIN for call security. Empty string = no PIN |

#### Field Details & Available Options

**`trunkId`** (string, required)
- **Purpose**: Links dispatch rule to a specific SIP trunk
- **Options**: Must be a valid trunk ID from your account
- **Format**: Starts with `"ST_"` followed by alphanumeric characters
- **Example**: `"ST_MdFGqqPRBLQ7"`
- **How to Get**: Create a trunk first, or list existing trunks via `GET /api/sip/trunks`
- **Note**: Multiple dispatch rules can use the same trunk

**`name`** (string, optional)
- **Purpose**: Identifies the rule in LiveKit dashboard
- **Options**: Any descriptive string
- **Default**: Auto-generated with timestamp
- **Examples**: `"Support Agent Dispatch"`, `"VIP Conference Line"`, `"After-Hours Routing"`

**`type`** (string, required)
- **Purpose**: Determines call routing strategy
- **Available Options**:

  | Option | Description | Use Case | Cost Impact |
  |--------|-------------|----------|-------------|
  | `"individual"` | Each call creates a new unique room | One-on-one customer support, agent calls, private consultations | Higher room creation overhead |
  | `"direct"` | All calls join the same shared room | Conference calls, team meetings, group support | Single room, multiple participants |

- **Examples**:
  - `"individual"`: Customer calls +1-800-SUPPORT → Each caller gets their own room (`support-abc123`, `support-xyz789`)
  - `"direct"`: All callers to +1-800-MEETING → Everyone joins room `team-standup`

**`roomPrefix`** (string, conditional - required for `type: "individual"`)
- **Purpose**: Prefix for dynamically generated room names
- **Options**: Alphanumeric, hyphens, underscores (lowercase recommended)
- **Valid**: `"call"`, `"support"`, `"agent-call"`, `"customer_session"`
- **Invalid**: Spaces, special characters (`@`, `#`, `$`)
- **Room Name Pattern**: `{roomPrefix}-{uniqueId}`
- **Examples**:
  - `"call"` → Creates: `"call-a1b2c3"`, `"call-d4e5f6"`
  - `"support"` → Creates: `"support-x7y8z9"`
- **Max Length**: 64 characters (including generated suffix)
- **Cost**: Each room incurs participant-minute charges

**`roomName`** (string, conditional - required for `type: "direct"`)
- **Purpose**: Exact room name for all calls
- **Options**: Any valid room name string
- **Valid**: `"main-conference"`, `"support_room"`, `"team-meeting"`
- **Invalid**: Spaces, special characters
- **Examples**:
  - `"exec-conference"` → All callers join this single room
  - `"support-queue"` → Shared support room for all incoming calls
- **Max Length**: 64 characters
- **Cost**: Single room with multiple participants (N participants × minutes × rate)
- **Note**: Room persists across calls; participants can join/leave

**`pin`** (string, optional)
- **Purpose**: Security PIN required before call connects
- **Available Options**:
  - `""` (empty string) - No PIN protection (public access)
  - `"1234"` - 4-digit PIN (standard security)
  - `"123456"` - 6-digit PIN (higher security)
  - Any numeric string (digits only)
- **Default**: `""` (no PIN)
- **Behavior**:
  - If PIN set: Caller hears IVR prompt "Please enter your PIN followed by the pound key"
  - If PIN empty: Caller connects immediately
- **Use Cases**:
  - `""`: Public support lines, general inquiries
  - `"1234"`: Team meetings, department-specific lines
  - `"987654"`: Executive calls, confidential sessions
- **Cost**: Free (no additional charge for PIN feature)
- **Security**: PINs are transmitted securely; not exposed in API responses

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "dispatchRule": {
    "id": "SDR_jHKfy6ioBPPK",
    "name": "Support Agent Dispatch",
    "trunkIds": ["ST_MdFGqqPRBLQ7"],
    "metadata": "{\"createdAt\":\"2025-10-10T10:35:00Z\",\"type\":\"individual\"}"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing required fields: trunkId, type (individual or direct)"
}
```

```json
{
  "error": "roomPrefix is required for individual dispatch rule"
}
```

```json
{
  "error": "roomName is required for direct dispatch rule"
}
```

```json
{
  "error": "type must be either \"individual\" or \"direct\""
}
```

#### cURL Examples

**Individual Routing (Each call → New room):**
```bash
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_MdFGqqPRBLQ7",
    "name": "Support Agent Dispatch",
    "type": "individual",
    "roomPrefix": "support-call",
    "pin": ""
  }'
```

**Direct Routing (All calls → Same room):**
```bash
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_MdFGqqPRBLQ7",
    "name": "Conference Room Dispatch",
    "type": "direct",
    "roomName": "main-conference-room",
    "pin": "1234"
  }'
```

**With PIN Protection:**
```bash
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_MdFGqqPRBLQ7",
    "name": "Secure VIP Line",
    "type": "individual",
    "roomPrefix": "vip-call",
    "pin": "9876"
  }'
```

#### Usage Notes

- One trunk can have multiple dispatch rules
- Individual routing is recommended for customer support scenarios
- Direct routing is ideal for conference calls or team meetings
- PIN can be any numeric string (recommended: 4-6 digits)
- If PIN is set, callers will hear an IVR prompt to enter it

---

### 3. List All SIP Trunks

Retrieves all SIP trunks configured in your LiveKit project.

**Endpoint:** `GET /api/sip/trunks`

#### Request

No request body required.

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "trunks": [
    {
      "id": "ST_MdFGqqPRBLQ7",
      "name": "Customer Support Trunk",
      "numbers": ["+12345678900"],
      "metadata": "{\"department\":\"support\"}"
    },
    {
      "id": "ST_XYZ456789",
      "name": "Sales Trunk",
      "numbers": ["+19876543210"],
      "metadata": "{\"department\":\"sales\"}"
    }
  ]
}
```

**Empty Response:**
```json
{
  "success": true,
  "count": 0,
  "trunks": []
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `count` | number | Total number of trunks returned |
| `trunks` | array | Array of trunk objects |
| `trunks[].id` | string | Unique trunk identifier |
| `trunks[].name` | string | Trunk name |
| `trunks[].numbers` | string[] | Phone numbers associated with this trunk |
| `trunks[].metadata` | string | Trunk metadata (often JSON-encoded) |

#### cURL Example

```bash
curl http://localhost:4000/api/sip/trunks
```

#### Usage Notes

- Use this endpoint to verify trunk creation
- Retrieve trunk IDs for creating dispatch rules
- Monitor which phone numbers are currently in use

---

### 4. List All Dispatch Rules

Retrieves all dispatch rules configured in your LiveKit project.

**Endpoint:** `GET /api/sip/dispatch-rules`

#### Request

No request body required.

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "dispatchRules": [
    {
      "id": "SDR_jHKfy6ioBPPK",
      "name": "Support Agent Dispatch",
      "trunkIds": ["ST_MdFGqqPRBLQ7"],
      "metadata": "{\"type\":\"individual\",\"roomPrefix\":\"support-call\"}"
    },
    {
      "id": "SDR_ABC123456",
      "name": "Conference Dispatch",
      "trunkIds": ["ST_XYZ456789"],
      "metadata": "{\"type\":\"direct\",\"roomName\":\"main-conference\"}"
    }
  ]
}
```

**Empty Response:**
```json
{
  "success": true,
  "count": 0,
  "dispatchRules": []
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `count` | number | Total number of dispatch rules returned |
| `dispatchRules` | array | Array of dispatch rule objects |
| `dispatchRules[].id` | string | Unique dispatch rule identifier |
| `dispatchRules[].name` | string | Rule name |
| `dispatchRules[].trunkIds` | string[] | Array of trunk IDs this rule applies to |
| `dispatchRules[].metadata` | string | Rule metadata (often JSON-encoded with routing details) |

#### cURL Example

```bash
curl http://localhost:4000/api/sip/dispatch-rules
```

#### Usage Notes

- Use this to verify dispatch rule creation
- Check which trunks are associated with each rule
- Parse metadata to understand routing configuration

---

### 5. Delete SIP Trunk

Deletes a SIP trunk by its ID.

**Endpoint:** `DELETE /api/sip/trunk/:trunkId`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trunkId` | string | Yes | The unique identifier of the trunk to delete (e.g., "ST_MdFGqqPRBLQ7") |

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Trunk ST_MdFGqqPRBLQ7 deleted successfully"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Trunk not found or already deleted"
}
```

#### cURL Example

```bash
curl -X DELETE http://localhost:4000/api/sip/trunk/ST_MdFGqqPRBLQ7
```

#### Usage Notes

- Deleting a trunk will affect all associated dispatch rules
- Ensure no active calls are using this trunk before deletion
- This action cannot be undone
- Phone numbers become available for reuse after trunk deletion

---

### 6. Delete Dispatch Rule

Deletes a dispatch rule by its ID.

**Endpoint:** `DELETE /api/sip/dispatch-rule/:ruleId`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ruleId` | string | Yes | The unique identifier of the dispatch rule to delete (e.g., "SDR_jHKfy6ioBPPK") |

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Dispatch rule SDR_jHKfy6ioBPPK deleted successfully"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Dispatch rule not found or already deleted"
}
```

#### cURL Example

```bash
curl -X DELETE http://localhost:4000/api/sip/dispatch-rule/SDR_jHKfy6ioBPPK
```

#### Usage Notes

- Deleting a dispatch rule stops call routing through that rule
- The associated trunk remains active
- This action cannot be undone
- Ensure no active calls are using this rule before deletion

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success - Request completed successfully |
| `400` | Bad Request - Invalid input or missing required fields |
| `409` | Conflict - Resource already exists (e.g., duplicate phone number) |
| `500` | Internal Server Error - Server-side error or LiveKit API error |

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

Some errors include additional context:

```json
{
  "success": false,
  "error": "Phone number(s) already in use: +12345678900",
  "conflictingNumbers": ["+12345678900"],
  "existingTrunks": [...]
}
```

---

## Cost Comparison: Individual vs Direct Routing

Understanding the cost implications of your routing strategy is crucial for budgeting.

### Scenario Comparison

| Scenario | Type | Monthly Call Volume | Avg Call Duration | Monthly Cost Estimate |
|----------|------|---------------------|-------------------|----------------------|
| **Small Support Team** | Individual | 500 calls | 5 min/call | ~$70 |
| **Medium Support Team** | Individual | 2,000 calls | 8 min/call | ~$260 |
| **Large Support Team** | Individual | 10,000 calls | 6 min/call | ~$1,020 |
| **Daily Team Standup** | Direct | 20 participants × 30 days | 15 min/meeting | ~$90 |
| **Conference Bridge** | Direct | 50 participants × 30 days | 60 min/meeting | ~$900 |
| **24/7 Support Room** | Direct | 5 avg participants | 720 hours/month | ~$2,880 |

### Cost Breakdown Formula

**Individual Routing Cost:**
```
Monthly Cost = (Phone Number Rental) +
               (Calls/month × Duration × $0.0085 SIP) +
               (Calls/month × Duration × $0.008 Room)
```

**Direct Routing Cost:**
```
Monthly Cost = (Phone Number Rental) +
               (Concurrent Participants × Hours × 60 × $0.0085 SIP) +
               (Concurrent Participants × Hours × 60 × $0.008 Room)
```

### When to Use Each Type

**Use `individual` routing when:**
- ✅ Each call needs privacy (customer support, sales, consultations)
- ✅ You want to track individual call sessions
- ✅ Lower concurrent call volume
- ✅ One-on-one interactions
- 💰 **Cost**: Pay per call, scales linearly

**Use `direct` routing when:**
- ✅ Multiple people should join the same conversation
- ✅ Conference calls or team meetings
- ✅ Shared support queue (multiple agents in one room)
- ✅ Persistent room needed across calls
- 💰 **Cost**: Pay for concurrent participants, not total calls

---

## Examples

### Complete Workflow: Setup SIP for Customer Support

**Cost Estimate**: ~$70/month (500 calls × 5 min average)

```bash
# Step 1: Create a SIP trunk
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Line",
    "phoneNumbers": ["+18005551234"],
    "metadata": "{\"department\":\"support\",\"hours\":\"24/7\"}",
    "krispEnabled": true
  }'

# Response: Save the trunk ID (e.g., ST_ABC123)

# Step 2: Create individual dispatch rule (each call → new room)
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_ABC123",
    "name": "Support Call Routing",
    "type": "individual",
    "roomPrefix": "support",
    "pin": ""
  }'

# Response: Save the dispatch rule ID (e.g., SDR_XYZ789)

# Step 3: Verify setup
curl http://localhost:4000/api/sip/trunks
curl http://localhost:4000/api/sip/dispatch-rules

# When customers call +18005551234, they'll be connected to rooms like:
# "support-abc123", "support-def456", etc. (unique per call)

# Expected costs for 500 calls/month × 5 min:
# - Phone rental: ~$1.50/month
# - SIP inbound: 2,500 min × $0.0085 = $21.25
# - Room minutes: 2,500 min × $0.008 = $20
# - Krisp: Free
# Total: ~$42.75/month
```

### Example: Secure Conference Line with PIN

**Cost Estimate**: ~$90/month (20 participants × 15 min/day × 30 days)

```bash
# Create trunk for conference line
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Executive Conference Line",
    "phoneNumbers": ["+18005556789"],
    "krispEnabled": true
  }'

# Create direct dispatch rule with PIN protection
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_CONF123",
    "name": "Executive Conference Room",
    "type": "direct",
    "roomName": "exec-conference",
    "pin": "8888"
  }'

# All callers will:
# 1. Call +18005556789
# 2. Be prompted to enter PIN: 8888
# 3. Join the same room: "exec-conference"

# Expected costs for 20 participants × 15 min/day × 30 days:
# - Phone rental: ~$1.50/month
# - SIP inbound: 20 × 15 × 30 × $0.0085 = $76.50
# - Room minutes: 20 × 15 × 30 × $0.008 = $72
# - PIN protection: Free
# Total: ~$150/month
```

### Example: Multiple Trunks for Different Departments

**Cost Estimate**:
- Sales: ~$140/month (1,000 calls × 7 min average)
- Support: ~$200/month (1,500 calls × 8 min average)
- **Total: ~$340/month**

```bash
# Sales trunk
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Line",
    "phoneNumbers": ["+18005551111"]
  }'

# Support trunk
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Line",
    "phoneNumbers": ["+18005552222"]
  }'

# Sales dispatch rule
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_SALES",
    "name": "Sales Routing",
    "type": "individual",
    "roomPrefix": "sales-call"
  }'

# Support dispatch rule
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_SUPPORT",
    "name": "Support Routing",
    "type": "individual",
    "roomPrefix": "support-call"
  }'
```

### Example: Testing and Cleanup

```bash
# List all resources
curl http://localhost:4000/api/sip/trunks
curl http://localhost:4000/api/sip/dispatch-rules

# Delete a dispatch rule
curl -X DELETE http://localhost:4000/api/sip/dispatch-rule/SDR_TEST123

# Delete a trunk
curl -X DELETE http://localhost:4000/api/sip/trunk/ST_TEST123

# Verify deletion
curl http://localhost:4000/api/sip/trunks
```

---

## Integration with Postman

### Import Collection

1. Open Postman
2. Click **Import** → **Raw text**
3. Paste the following collection JSON:

```json
{
  "info": {
    "name": "LiveKit SIP Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create SIP Trunk",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"My Trunk\",\n  \"phoneNumbers\": [\"+12345678900\"],\n  \"krispEnabled\": true\n}"
        },
        "url": {"raw": "http://localhost:4000/api/sip/trunk"}
      }
    },
    {
      "name": "List Trunks",
      "request": {
        "method": "GET",
        "url": {"raw": "http://localhost:4000/api/sip/trunks"}
      }
    }
  ]
}
```

### Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:4000`
- `trunk_id`: (save from create trunk response)
- `rule_id`: (save from create dispatch rule response)

---

## Quick Reference: All Field Options

### Phone Number Formats (E.164)

| Country | Format | Example | Monthly Cost |
|---------|--------|---------|--------------|
| 🇺🇸 USA/Canada | +1XXXXXXXXXX | `"+18005551234"` | $1-2/month |
| 🇬🇧 UK | +44XXXXXXXXXX | `"+442071234567"` | $2-3/month |
| 🇩🇪 Germany | +49XXXXXXXXXX | `"+4930123456"` | $2-4/month |
| 🇫🇷 France | +33XXXXXXXXX | `"+33123456789"` | $2-4/month |
| 🇦🇺 Australia | +61XXXXXXXXX | `"+61212345678"` | $3-5/month |
| 🇯🇵 Japan | +81XXXXXXXXX | `"+81312345678"` | $4-6/month |
| 🇮🇳 India | +91XXXXXXXXXX | `"+919876543210"` | $2-3/month |

### Boolean Options

| Field | `true` | `false` | Default | Cost Difference |
|-------|--------|---------|---------|-----------------|
| `krispEnabled` | Noise cancellation ON | Noise cancellation OFF | `true` | No difference (free) |

### Routing Type Options

| Value | Description | Required Fields | Typical Use Case | Cost Model |
|-------|-------------|----------------|------------------|------------|
| `"individual"` | Each call → New room | `roomPrefix` | Customer support, sales | Pay per call |
| `"direct"` | All calls → Same room | `roomName` | Conferences, team meetings | Pay per participant |

### PIN Options

| Value | Security Level | Use Case | User Experience |
|-------|----------------|----------|-----------------|
| `""` (empty) | 🔓 None | Public lines, support | Immediate connection |
| `"1234"` | 🔒 Low | Internal team lines | Quick entry (4 digits) |
| `"123456"` | 🔒🔒 Medium | Department-specific | Moderate entry (6 digits) |
| `"12345678"` | 🔒🔒🔒 High | Executive/VIP lines | Longer entry (8+ digits) |

### Metadata Suggestions

Common metadata patterns for better organization:

```json
// Department tracking
{"department": "support", "region": "US-West", "tier": "premium"}

// Cost center allocation
{"costCenter": "CC-1234", "project": "CustomerXP", "owner": "john@company.com"}

// Service hours
{"hours": "24/7", "timezone": "UTC-8", "holidays": "closed"}

// Call routing
{"priority": "high", "skillset": "technical", "language": "en-US"}

// Audit trail
{"createdBy": "admin", "purpose": "Q4-campaign", "expiresAt": "2025-12-31"}
```

### Room Naming Best Practices

**Valid room names** (alphanumeric, hyphens, underscores):
- ✅ `"support-call"`
- ✅ `"sales_room"`
- ✅ `"agent-session-2025"`
- ✅ `"team-standup"`

**Invalid room names**:
- ❌ `"support call"` (spaces)
- ❌ `"sales@room"` (special chars)
- ❌ `"team#meeting"` (special chars)
- ❌ `"room!123"` (special chars)

---

## Cost Optimization Tips

### 1. Choose the Right Routing Type

```bash
# ❌ Expensive: Using "direct" for customer support
# Cost: All customers in one room = high concurrent participant cost
{
  "type": "direct",
  "roomName": "support"
}
# Monthly cost for 1000 calls with avg 3 concurrent: ~$2,000

# ✅ Efficient: Using "individual" for customer support
# Cost: Each customer in their own room = sequential calls
{
  "type": "individual",
  "roomPrefix": "support"
}
# Monthly cost for 1000 calls × 5min: ~$170
```

### 2. Optimize Call Duration

- Enable Krisp to reduce call length (clearer audio = faster resolution)
- Use PIN protection to prevent unauthorized usage
- Monitor average call duration and set alerts

### 3. Share Trunks Across Departments

```bash
# ❌ Expensive: Separate trunk per department (3 phone numbers)
# Cost: 3 × $2/month = $6/month for phone rentals

# ✅ Efficient: One trunk, multiple dispatch rules
# Cost: 1 × $2/month = $2/month for phone rental
# Use different dispatch rules to route to different room prefixes
```

### 4. Use Toll-Free Numbers Wisely

- **Regular number** ($1/month + $0.0085/min): Use for outbound support
- **Toll-free number** ($3/month + $0.022/min): Use for inbound customer calls

### 5. Monitor and Alert

Set up monitoring for:
- Unusually long call durations (stuck connections)
- High concurrent participant counts (possible abuse)
- Failed calls (configuration issues)
- PIN failures (security concerns)

---

## Troubleshooting

### Common Issues

**Issue**: `"Phone number(s) already in use"`
- **Cause**: Number is assigned to another trunk
- **Solution**: List all trunks (`GET /api/sip/trunks`), delete old trunk, or use different number

**Issue**: `"Missing required fields: roomPrefix"`
- **Cause**: Using `type: "individual"` without `roomPrefix`
- **Solution**: Add `"roomPrefix": "your-prefix"` to request body

**Issue**: `"Missing required fields: roomName"`
- **Cause**: Using `type: "direct"` without `roomName`
- **Solution**: Add `"roomName": "your-room-name"` to request body

**Issue**: High unexpected costs
- **Cause**: Long-running calls or misconfigured direct routing
- **Solution**: Review call logs, check for stuck connections, verify routing type

**Issue**: Calls not connecting
- **Cause**: Invalid trunk ID or deleted dispatch rule
- **Solution**: Verify trunk exists (`GET /api/sip/trunks`), check dispatch rule status

**Issue**: PIN not working
- **Cause**: PIN contains non-numeric characters
- **Solution**: Use numeric-only PINs (e.g., `"1234"`, not `"12ab"`)

---

## Support and Resources

- **LiveKit Documentation**: https://docs.livekit.io
- **SIP Integration Guide**: https://docs.livekit.io/guides/sip
- **Pricing Calculator**: https://livekit.io/pricing
- **API Server Code**: `api-server.js`
- **GitHub Issues**: Report bugs and request features
- **Community Support**: LiveKit Discord & Forums

---

## Changelog

### Version 1.0.0 (2025-10-10)
- ✨ Initial API release
- ✨ Support for SIP trunk management (create, list, delete)
- ✨ Individual and direct dispatch routing
- ✨ PIN protection for secure calls
- ✨ Krisp noise cancellation support (free)
- 📊 Comprehensive cost documentation
- 📚 Detailed field options and examples
- 🔧 Troubleshooting guide

---

## API Rate Limits

Current rate limits (subject to change):
- **Create Trunk**: 10 requests/minute
- **Create Dispatch Rule**: 20 requests/minute
- **List Operations**: 100 requests/minute
- **Delete Operations**: 20 requests/minute

If you exceed rate limits, you'll receive:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 60 seconds."
}
```

---

## Security Best Practices

1. **Never expose API credentials in client-side code**
   - Keep `.env` file secure and out of version control
   - Use server-to-server authentication only

2. **Use PIN protection for sensitive lines**
   - Executive lines: 6-8 digit PINs
   - Team lines: 4-6 digit PINs
   - Rotate PINs regularly

3. **Monitor for unusual activity**
   - Set up alerts for high call volumes
   - Review call logs regularly
   - Track costs monthly

4. **Implement proper cleanup**
   - Delete unused trunks to free phone numbers
   - Remove old dispatch rules
   - Archive metadata for audit trails

5. **Use HTTPS in production**
   - Never use `http://` in production
   - Implement SSL/TLS certificates
   - Use secure WebSocket connections (`wss://`)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-10
**API Version**: 1.0.0
**Maintained By**: LiveKit SIP Management Team
