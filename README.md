# WhatsApp OTP Receive Bot 🤖📲

Sistem **Reverse-OTP** menggunakan WhatsApp. Alih-alih server mengirim tagihan SMS OTP kepada pengguna, pengguna memvalidasi permintaan OTP mereka dengan mengirimkan kode langsung ke bot WhatsApp ini. Bot kemudian menghubungi API (melalui *webhook*) untuk memverifikasi OTP.

## 🌟 Fitur Utama
- **Reverse OTP API**: Generate kode unik menggunakan REST API.
- **WhatsApp Web Socket Listener**: Verifikasi pesan kode yang masuk dari pengguna secara *real-time*.
- **Webhook Callback**: Memicu URL aplikasi Anda dengan mode *retry* bila server Anda sedang *down*.
- **Rate-Limiting & Security**: Membatasi penggunaan per IP dan per Nomor Telepon, Hash Storage, Brute Force protection, serta pengamanan Secret Key API.
- **Auto-Cleanup**: Data OTP yang sudah *expired* langsung ditolak/hangus.
- **Anti-Ban Features**: Human-Typing Simulation dan *random delay* sebelum bot membalas.

## 🚀 Quick Setup

### 1. Requirements
* Node.js v20 atau lebih baru (Diwajibkan oleh `baileys` v7)
* Nomor WhatsApp (Khusus Bot)

### 2. Instalasi
```bash
git clone <your-repo-url>
cd whatsapp-otp-receive
npm install
```

### 3. Konfigurasi Database dan Environment
Salin template konfigurasi:
```bash
cp .env.example .env
```
Sesuaikan port, key auth, host, webhook delay, nomor telpon WA bot, serta interval dari OTP yang diperlukan pada file `.env`.

### 4. Eksekusi Pertama & QR Code
Jalankan bot dalam mode *development*:
```bash
npm run dev
```
1. Lihat console Terminal Anda.
2. Anda akan diminta untuk melakukan **scan QR Code**.
3. Buka "Perangkat Tertaut" / "Linked Devices" di aplikasi WhatsApp (khusus nomor Bot) Anda, dan scan QR Code tersebut.
4. Sesi otentikasi akan tersimpan di dalam folder `auth_state/` supaya aman jika Node direstart.

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
    "whatsapp_number": "Nomor_WA_Bot",
    "instruction": "Kirim kode 482916 ke nomor WhatsApp Nomor_WA_Bot",
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

## ⚠️ Peringatan (Disclaimer)
Ini adalah library Unofficial (*non-official*) dari WhatsApp (`@whiskeysockets/baileys`). Jangan membanjiri request dengan pesan SPAM atau pesan broadcast massal untuk mencegah banned akun Bot Anda.

## 🛠️ Stack & Library
- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web Socket Client
- [Express.js](https://expressjs.com/) - REST API
- [Better-Sqlite3](https://github.com/WiseLibs/better-sqlite3) - File-Based Local Database
- [Zod](https://zod.dev/) - Request Payload Validation
- Pino & Zod

---
*Created by [Nekofi]*
