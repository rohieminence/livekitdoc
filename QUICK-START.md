# Quick Start Guide

## ✅ Your Current Setup

- **Trunk ID**: `ST_MdFGqqPRBLQ7`
- **Dispatch Rule ID**: `SDR_jHKfy6ioBPPK`
- **Phone Number**: `+12345678900`
- **Room Prefix**: `call-`

---

## 🚀 Start Servers

### Option 1: API Server (REST API)
```bash
npm run api
# Server runs on http://localhost:4000
```

### Option 2: Webhook Server (Receive LiveKit Events)
```bash
npm run webhook
# Server runs on http://localhost:3000
```

---

## 📋 Quick cURL Commands

### List All Trunks
```bash
curl http://localhost:4000/api/sip/trunks
```

### List All Dispatch Rules
```bash
curl http://localhost:4000/api/sip/dispatch-rules
```

### Create New Trunk
```bash
curl -X POST http://localhost:4000/api/sip/trunk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Trunk",
    "phoneNumbers": ["+19999999999"]
  }'
```

### Create Dispatch Rule
```bash
curl -X POST http://localhost:4000/api/sip/dispatch-rule \
  -H "Content-Type: application/json" \
  -d '{
    "trunkId": "ST_MdFGqqPRBLQ7",
    "name": "My Dispatch",
    "type": "individual",
    "roomPrefix": "call"
  }'
```

---

## 📦 Import to Postman

1. Open Postman
2. Click **Import**
3. Select file: `postman-collection.json`
4. Done! All endpoints ready to use

---

## 📚 Full Documentation

- **API Guide**: [API-GUIDE.md](API-GUIDE.md)
- **Main README**: [README.md](README.md)
- **Claude Guide**: [CLAUDE.md](CLAUDE.md)

---

## 🔗 Files Created

1. **api-server.js** - REST API server for SIP management
2. **API-GUIDE.md** - Complete API documentation with cURL examples
3. **postman-collection.json** - Import this into Postman
4. **QUICK-START.md** - This file

---

## 🎯 Next Steps

1. **Start API server**: `npm run api`
2. **Test with cURL** or import `postman-collection.json` to Postman
3. **Start webhook server**: `npm run webhook` (in another terminal)
4. **Expose webhook**: Use localtunnel (`lt --port 3000`) or ngrok
5. **Configure webhook in LiveKit Dashboard**
