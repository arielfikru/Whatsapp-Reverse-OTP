# WhatsApp OTP Receive Bot 🤖📲

A **Reverse-OTP** system using WhatsApp. Instead of the server sending SMS OTPs at a cost, the user validates their OTP request by sending the code directly to this WhatsApp bot. The bot then triggers a callback to your API (via *webhook*) to verify the OTP.

## 🌟 Key Features
- **Reverse OTP API**: Generate unique OTP codes via REST API.
- **WhatsApp Web Socket Listener**: Verify incoming message codes from users in *real-time*.
- **Webhook Callback**: Triggers an endpoint in your application with a *retry* mode (exponential backoff) if your server is *down*.
- **Rate-Limiting & Security**: Protects against abuse by limiting requests per IP and phone number, features Hash Storage, brute force protection, and API Key authentication.
- **Auto-Cleanup**: Expired OTP records are automatically invalidated and rejected.
- **Anti-Ban Features**: Implements human-typing simulation and *random delays* before replying.

## 🚀 Quick Setup

### 1. Requirements
* Node.js v20 or newer (Required by `baileys` v7)
* A dedicated WhatsApp number (For the Bot)

### 2. Installation
```bash
git clone https://github.com/arielfikru/Whatsapp-Reverse-OTP.git
cd Whatsapp-Reverse-OTP
npm install
```

### 3. Environment Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
Adjust the port, auth key, host, webhook delay, bot phone number, and interval values in the `.env` file according to your needs.

### 4. Running the Bot & QR Code Login
Run the bot in *development* mode:
```bash
npm run dev
```
1. Watch your terminal console.
2. You will be prompted to **scan a QR Code**.
3. Open "Linked Devices" in your WhatsApp app (using the bot's phone number), and scan the QR Code.
4. The authentication session will be securely saved in the `auth_state/` folder to persist through Node.js restarts.

## 🔌 API Documentation

### 1. Generate OTP
**Request:**
`POST /api/otp/generate`
```json
{
  "phone": "6281234567890",
  "callback_url": "https://yourapp.com/api/webhook/otp",
  "metadata": { "user_id": 123 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "otp_id": "otp_7f3a2b1c",
    "code": "482916",
    "phone": "6281234567890",
    "whatsapp_number": "Your_Bot_WhatsApp_Number",
    "instruction": "Send code 482916 to WhatsApp number Your_Bot_WhatsApp_Number",
    "expires_at": "...",
    "expires_in_seconds": 300
  }
}
```

### 2. Check Status
**Request:**
`GET /api/otp/status/:otp_id`

### 3. Healthcheck
**Request:**
`GET /api/health`

## ⚠️ Disclaimer
This project uses an Unofficial library (`@whiskeysockets/baileys`). Do not abuse this by sending SPAM or mass broadcast messages, as it may result in your bot account getting banned. Use responsibly.

## 🛠️ Stack & Libraries
- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web Socket Client
- [Express.js](https://expressjs.com/) - REST API
- [Better-Sqlite3](https://github.com/WiseLibs/better-sqlite3) - File-Based Local Database
- [Zod](https://zod.dev/) - Request Payload Validation
- Pino Logger & Express Rate Limit
