# Telegram Bot Starter

Bot Telegram dasar pakai [Telegraf](https://telegraf.js.org/), siap deploy ke Railway.

## Cara jalanin lokal

1. Copy `.env.example` jadi `.env`, isi `BOT_TOKEN` dari @BotFather
2. `npm install`
3. `npm start`

## Cara deploy ke Railway

1. Push folder ini ke repo GitHub baru
2. Di Railway, connect repo tersebut ke project (misal `magnificent-gratitude`)
3. Buka tab **Variables**, tambahkan `BOT_TOKEN` = token dari @BotFather
4. Railway otomatis detect `npm start` dan deploy

## Struktur

- `index.js` — semua logic bot ada di sini (command, handler pesan, dll)
- Command yang tersedia: `/start`, `/help`, `/ping`
- Handler `bot.on('text', ...)` — ini contoh auto-reply, bisa diganti logic apapun (misal panggil AI, simpan ke database, dll)

## Next steps (nanti dikembangin sesuai kebutuhan)

- [ ] Tentuin fungsi bot mau ngapain
- [ ] Kalau butuh nyimpen data → tambah database (Supabase, dll)
- [ ] Kalau butuh AI reply → integrasi API (Claude/DeepSeek/OpenAI)
- [ ] Kalau traffic besar → pertimbangkan webhook mode, bukan polling
