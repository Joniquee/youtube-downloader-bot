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
console.log("TOKEN:", process.env.TELEGRAM_BOT_TOKEN)
const bot = new Telegraf(token);
console.log("bot created")
// Команды
bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('stats', handleStats);
console.log("commands init")

// Обработка текстовых сообщений (YouTube ссылки)
bot.on('text', handleMessage);

// Обработка callback-кнопок
bot.action(/^type_/, handleTypeSelection);
bot.action(/^quality_/, handleQualitySelection);
bot.action('back_to_type', handleQualitySelection);
bot.action('cancel', handleTypeSelection);
console.log("callbacks")

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err);
  ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте снова.');
});

// Запуск бота
(async () => {
  try {
    await bot.launch();
    console.log('🤖 Бот успешно запущен!');
    console.log('Ожидание сообщений...');
  } catch (err) {
    console.error('Ошибка запуска бота:', err);
    process.exit(1);
  }
})();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));