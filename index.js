require('dotenv').config();
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN belum diset. Tambahkan di file .env atau Railway Variables.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// ===== COMMANDS =====

bot.start((ctx) => {
  ctx.reply(
    `Halo ${ctx.from.first_name}! 👋\n\nBot ini masih basic, siap dikembangin sesuai kebutuhan.\n\nKetik /help buat lihat perintah yang tersedia.`
  );
});

bot.help((ctx) => {
  ctx.reply(
    [
      'Daftar perintah:',
      '/start - Mulai bot',
      '/help - Bantuan',
      '/ping - Cek bot masih hidup atau nggak',
    ].join('\n')
  );
});

bot.command('ping', (ctx) => {
  ctx.reply('🏓 Pong! Bot aktif dan jalan normal.');
});

// ===== ECHO / DEFAULT HANDLER (contoh, bisa dihapus/diganti) =====

bot.on('text', (ctx) => {
  ctx.reply(`Kamu bilang: "${ctx.message.text}"\n\n(Ini masih auto-echo, nanti bisa diganti logic sesuai kebutuhan)`);
});

// ===== ERROR HANDLING =====

bot.catch((err, ctx) => {
  console.error(`Error untuk ${ctx.updateType}:`, err);
});

// ===== LAUNCH =====

bot.launch().then(() => {
  console.log('✅ Bot berhasil jalan (polling mode)');
});

// Graceful shutdown (penting buat platform kayak Railway)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
