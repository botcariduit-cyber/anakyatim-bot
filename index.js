require('dotenv').config();
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GCONTACT_API_KEY = process.env.GCONTACT_API_KEY;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN belum diset. Tambahkan di file .env atau Railway Variables.');
  process.exit(1);
}

if (!GCONTACT_API_KEY) {
  console.warn('⚠️  GCONTACT_API_KEY belum diset. Fitur cek nomor tidak akan berfungsi.');
}

const bot = new Telegraf(BOT_TOKEN);

// Regex sederhana buat deteksi nomor HP Indonesia (08xxx atau 62xxx atau +62xxx)
const PHONE_REGEX = /^(\+?62|0)8[0-9]{8,11}$/;

// Fungsi buat manggil API GContact
async function cekNomor(nomor) {
  const url = `https://gcontact.id/api?token=${GCONTACT_API_KEY}&nomor=${encodeURIComponent(nomor)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Format hasil lookup jadi pesan yang rapi buat dikirim ke user
function formatHasilCek(data) {
  if (!data.ok) {
    return `❌ Gagal cek nomor.\n${data.description || data.summary || 'Terjadi kesalahan, coba lagi nanti.'}`;
  }

  let pesan = `📱 *Hasil Cek Nomor*\n\n`;
  pesan += `Nomor: ${data.nomor}\n`;
  pesan += `Nama: ${data.primary_name || '-'}\n`;

  if (data.tag && data.tag.length > 0) {
    pesan += `\n🏷️ *Tag Populer:*\n`;
    data.tag.slice(0, 5).forEach((t) => {
      pesan += `• ${t.tag} (${t.count}x)\n`;
    });
  }

  if (data.whatsapp) {
    pesan += `\n💬 *WhatsApp:* ${data.whatsapp.registered ? `Terdaftar (${data.whatsapp.name})` : 'Tidak terdaftar'}\n`;
  }

  if (data.ewallet && data.ewallet.length > 0) {
    pesan += `\n💳 *E-Wallet:*\n`;
    data.ewallet.forEach((e) => {
      pesan += `• ${e.provider}: ${e.registered ? `✅ (${e.name})` : '❌'}\n`;
    });
  }

  if (data.summary) {
    pesan += `\n📝 *Ringkasan:* ${data.summary}\n`;
  }

  pesan += `\n_Sisa quota: ${data.remaining_quota ?? '-'}_`;

  return pesan;
}

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
      '/cek 08xxxxxxxxxx - Cek info nomor HP',
      '',
      'Atau langsung kirim nomor HP-nya aja.',
    ].join('\n')
  );
});

bot.command('ping', (ctx) => {
  ctx.reply('🏓 Pong! Bot aktif dan jalan normal.');
});

bot.command('cek', async (ctx) => {
  const nomor = ctx.message.text.replace('/cek', '').trim();

  if (!nomor) {
    return ctx.reply('Format: /cek 08123456789');
  }

  if (!PHONE_REGEX.test(nomor)) {
    return ctx.reply('❌ Format nomor tidak valid. Contoh: 08123456789');
  }

  await ctx.reply('🔍 Sedang mencari...');

  try {
    const data = await cekNomor(nomor);
    await ctx.replyWithMarkdown(formatHasilCek(data));
  } catch (err) {
    console.error('Error cek nomor:', err);
    await ctx.reply('❌ Terjadi kesalahan saat mengecek nomor. Coba lagi nanti.');
  }
});

// ===== HANDLER PESAN TEKS =====

bot.on('text', async (ctx) => {
  const teks = ctx.message.text.trim();

  // Kalau teks yang dikirim berupa nomor HP, langsung cek otomatis
  if (PHONE_REGEX.test(teks)) {
    await ctx.reply('🔍 Sedang mencari...');
    try {
      const data = await cekNomor(teks);
      await ctx.replyWithMarkdown(formatHasilCek(data));
    } catch (err) {
      console.error('Error cek nomor:', err);
      await ctx.reply('❌ Terjadi kesalahan saat mengecek nomor. Coba lagi nanti.');
    }
    return;
  }

  ctx.reply('Ketik /help untuk lihat daftar perintah, atau kirim nomor HP untuk dicek.');
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
