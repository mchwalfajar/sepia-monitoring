const TelegramBot = require("node-telegram-bot-api");
const ping = require("ping");
const pidusage = require("pidusage");

const token = "7202428875:AAE0cj6sGDO1R0U5MCwBus8i353QvjHSc2Q";
const chatId = "-1003148589452";
const targetIP = "192.168.1.200"; 
const intervalPing = 1 * 6000; // 1 menit

const bot = new TelegramBot(token, { polling: true });

let isDown = false;

async function checkPing() {
  const res = await ping.promise.probe(targetIP, {
    timeout: 2,
  });

  const timestamp = new Date().toLocaleString("id-ID");

  if (!res.alive) {
    // Server Down
    if (!isDown) {
      isDown = true;
      bot.sendMessage(
        chatId,
        `*ALERT DOWN!*\n\nServer Sepia *${targetIP}* is down. Downtime: ${timestamp} WIB`,
        { parse_mode: "Markdown" }
      );
      console.log(`[DOWN] ${targetIP} - ${timestamp}`);
    }
  } else {
    // Server up
    if (isDown) {
      isDown = false;
      bot.sendMessage(
        chatId,
        `*RECOVERY*\n\nServer Sepia *${targetIP}* is up. Uptime: ${timestamp} WIB`,
        { parse_mode: "Markdown" }
      );
      console.log(`[UP] ${targetIP} - ${timestamp}`);
    }
  }
}

setInterval(checkPing, intervalPing);

bot.onText(/\/status/, () => {
  bot.sendMessage(chatId, `Server Sepia ${targetIP} is ${isDown ? "down" : "up"}`);
});

bot.onText(/\/resource/, () => {
  pidusage(process.pid, (err, stats) => {
    if (err) return bot.sendMessage(chatId, "Error: " + err.message);

    const cpu = stats.cpu.toFixed(2);
    const mem = (stats.memory / 1024 / 1024).toFixed(2);

    bot.sendMessage(
      chatId,
      `*Bot Resource Usage*\n\nCPU: *${cpu}%*\nRAM: *${mem} MB*\nPID: ${process.pid}`,
      { parse_mode: "Markdown" }
    );
  });
});

console.log("Bot monitoring ping berjalan...");
