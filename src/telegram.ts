import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const sendTelegramAlarm = async (message: string, retryCount = 0): Promise<void> => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: message,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second
      family: 4, // use IPv4
    });

    if (response.status === 200 && response.data.ok) {
      console.log('Telegram alert sent successfully');
    } else {
      console.log(`Failed to send Telegram alert: ${response.data.description || response.statusText}`);
    }
  } catch (error: any) {
    console.error(`Error sending Telegram alarm: ${error}`);

    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendTelegramAlarm(message, retryCount - 1);
    }
  }
};

// const testTelegramAlarm = async () => {
//   try {
//     await sendTelegramAlarm('Test message from Node.js application');
//   } catch (error) {
//     console.error('Error in testTelegramAlarm:', error);
//   }
// };
// testTelegramAlarm();

export { sendTelegramAlarm };