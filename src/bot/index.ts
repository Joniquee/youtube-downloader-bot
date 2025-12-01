import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { handleStart, handleHelp } from './handlers/start';
import { 
  handleMessage, 
  handleTypeSelection, 
  handleQualitySelection,
  handleStats 
} from './handlers/download';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN не установлен в переменных окружения');
}

const bot = new Telegraf(token);

// Команды
bot.command('start', (ctx) => {
  process.stdout.write(`📨 /start от пользователя ${ctx.from?.first_name} (@${ctx.from?.username || 'без username'})\n`);
  return handleStart(ctx);
});

bot.command('help', (ctx) => {
  process.stdout.write(`📨 /help от пользователя ${ctx.from?.first_name}\n`);
  return handleHelp(ctx);
});

bot.command('stats', (ctx) => {
  process.stdout.write(`📨 /stats от пользователя ${ctx.from?.first_name}\n`);
  return handleStats(ctx);
});

// Обработка текстовых сообщений (YouTube ссылки)
bot.on('text', (ctx) => {
  const text = ctx.message.text;
  console.log(`📩 Сообщение от ${ctx.from?.first_name}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
  return handleMessage(ctx);
});

// Обработка callback-кнопок
bot.action(/^type_/, handleTypeSelection);
bot.action(/^quality_/, handleQualitySelection);
bot.action('back_to_type', handleQualitySelection);
bot.action('cancel', handleTypeSelection);

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ Ошибка бота:');
  console.error(`Пользователь: ${ctx.from?.first_name} (@${ctx.from?.username})`);
  console.error(`Ошибка: ${err}`);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте снова.').catch(() => {});
});

// Запуск бота
bot.launch()
  .then(async () => {
    const botInfo = await bot.telegram.getMe();
    
    // Принудительно выводим в консоль (решает проблему с буферизацией)
    process.stdout.write('\n');
    process.stdout.write('╔════════════════════════════════════════╗\n');
    process.stdout.write('║   🤖 БОТ УСПЕШНО ЗАПУЩЕН!            ║\n');
    process.stdout.write('╚════════════════════════════════════════╝\n');
    process.stdout.write('\n');
    process.stdout.write(`📱 Имя бота: @${botInfo.username}\n`);
    process.stdout.write(`🆔 ID: ${botInfo.id}\n`);
    process.stdout.write(`✅ Статус: Онлайн\n`);
    process.stdout.write('\n');
    process.stdout.write('⏳ Ожидание сообщений...\n');
    process.stdout.write('\n');
    process.stdout.write('💡 Откройте Telegram и найдите вашего бота\n');
    process.stdout.write(`   https://t.me/${botInfo.username}\n`);
    process.stdout.write('\n');
    process.stdout.write('⚙️  Для остановки нажмите Ctrl+C\n');
    process.stdout.write('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.stdout.write('\n');
  })
  .catch((err) => {
    process.stderr.write('❌ Ошибка запуска бота: ' + err + '\n');
    process.stderr.write('\n');
    process.stderr.write('Возможные причины:\n');
    process.stderr.write('1. Неверный токен в .env файле\n');
    process.stderr.write('2. Нет интернет-соединения\n');
    process.stderr.write('3. Токен уже используется другим процессом\n');
    process.exit(1);
  });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));