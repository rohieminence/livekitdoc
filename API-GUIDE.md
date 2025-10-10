# LiveKit SIP Management API Guide

## Start API Server

```bash
npm run api
```

Server runs on `http://localhost:4000`

---

## cURL Commands for Postman/Terminal

### 1. Create SIP Trunk

```bash
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Agent Trunk",
    "phoneNumbers": ["+12345678900"],
    "metadata": "Created via API",
    "krispEnabled": true
  }'
```

**Response:**
```json
{
  "success": true,
  "trunk": {
    "id": "ST_xxxxx",
    "name": "My Agent Trunk",
    "numbers": ["+12345678900"],
    "metadata": "Created via API"
  }
}
```

---

### 2. Create Dispatch Rule (Individual Rooms)

Each call creates a new room with prefix `call-<unique-id>`

```bash
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_MdFGqqPRBLQ7",
    "name": "Agent Dispatch Rule",
    "type": "individual",
    "roomPrefix": "call",
    "pin": ""
  }'
```

**Response:**
```json
{
  "success": true,
  "dispatchRule": {
    "id": "SDR_xxxxx",
    "name": "Agent Dispatch Rule",
    "trunkIds": ["ST_MdFGqqPRBLQ7"],
    "metadata": "{\"createdAt\":\"...\",\"type\":\"individual\"}"
  }
}
```

---

### 3. Create Dispatch Rule (Direct - All calls to same room)

All calls go to the same room

```bash
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_MdFGqqPRBLQ7",
    "name": "Direct Dispatch Rule",
    "type": "direct",
    "roomName": "main-support-room",
    "pin": "1234"
  }'
```

**Response:**
```json
{
  "success": true,
  "dispatchRule": {
    "id": "SDR_xxxxx",
    "name": "Direct Dispatch Rule",
    "trunkIds": ["ST_MdFGqqPRBLQ7"],
    "metadata": "{\"createdAt\":\"...\",\"type\":\"direct\"}"
  }
}
```

---

### 4. List All SIP Trunks

```bash
curl http://localhost:4000/api/sip/trunks
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "trunks": [
    {
      "id": "ST_MdFGqqPRBLQ7",
      "name": "My Agent Trunk",
      "numbers": ["+12345678900"],
      "metadata": "..."
    }
  ]
}
```

---

### 5. List All Dispatch Rules

```bash
curl http://localhost:4000/api/sip/dispatch-rules
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "dispatchRules": [
    {
      "id": "SDR_jHKfy6ioBPPK",
      "name": "Agent Dispatch Rule",
      "trunkIds": ["ST_MdFGqqPRBLQ7"],
      "metadata": "..."
    }
  ]
}
```

---

### 6. Delete SIP Trunk

```bash
curl -X DELETE http://localhost:4000/api/sip/trunk/ST_xxxxx
```

**Response:**
```json
{
  "success": true,
  "message": "Trunk ST_xxxxx deleted successfully"
}
```

---

### 7. Delete Dispatch Rule

```bash
curl -X DELETE http://localhost:4000/api/sip/dispatch-rule/SDR_xxxxx
```

**Response:**
```json
{
  "success": true,
  "message": "Dispatch rule SDR_xxxxx deleted successfully"
}
```

---

## Import to Postman

1. Open Postman
2. Click **Import**
3. Select file: `postman-collection.json`
4. All endpoints will be imported automatically

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sip/trunk` | Create SIP trunk |
| POST | `/api/sip/dispatch-rule` | Create dispatch rule |
| GET | `/api/sip/trunks` | List all trunks |
| GET | `/api/sip/dispatch-rules` | List all dispatch rules |
| DELETE | `/api/sip/trunk/:trunkId` | Delete trunk |
| DELETE | `/api/sip/dispatch-rule/:ruleId` | Delete dispatch rule |

---

## Request Body Schemas

### Create SIP Trunk
```json
{
  "name": "string (required)",
  "phoneNumbers": ["string array (required)"],
  "metadata": "string (optional)",
  "krispEnabled": "boolean (optional, default: true)"
}
```

### Create Dispatch Rule (Individual)
```json
{
  "trunkId": "string (required)",
  "name": "string (optional)",
  "type": "individual (required)",
  "roomPrefix": "string (required)",
  "pin": "string (optional)"
}
```

### Create Dispatch Rule (Direct)
```json
{
  "trunkId": "string (required)",
  "name": "string (optional)",
  "type": "direct (required)",
  "roomName": "string (required)",
  "pin": "string (optional)"
}
```

---

## Testing

1. Start API server:
   ```bash
   npm run api
   ```

2. Test endpoints:
   ```bash
   # List existing trunks
   curl http://localhost:4000/api/sip/trunks

   # List existing dispatch rules
   curl http://localhost:4000/api/sip/dispatch-rules
   ```

3. View API docs:
   ```bash
   curl http://localhost:4000/
   ```

---

## Notes

- API server runs on port **4000** (configurable via `API_PORT` in `.env`)
- Webhook server runs on port **3000** (separate server)
- Replace `ST_xxxxx` and `SDR_xxxxx` with actual IDs from responses
- Your current trunk ID: `ST_MdFGqqPRBLQ7`
- Your current dispatch rule ID: `SDR_jHKfy6ioBPPK`
