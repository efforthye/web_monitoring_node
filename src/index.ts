import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cheerio from 'cheerio';
import readline from 'readline';
import cron from 'node-cron';
import { fetchCounts } from './secret';
import { sendTelegramAlarm } from './telegram';
import { rateProcess } from './rate';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT ?? 3000;

// five second
cron.schedule('*/3 * * * * *', async () => {
    const secretDatasString = process.env.SECRET_DATAS;
    if(!secretDatasString) return;

    // parsing based on ,
    const secretDatas: string[] = secretDatasString.split(',').map(parsedData => parsedData.trim());

    for(let i = 0; i<secretDatas.length; i++){
        const secretData = secretDatas[i];

        const text = await fetchCounts({secretData});
        // console.log(text);

        // check if the text contains '::'
        if (text.includes('::')) {
            const [firstVar, comment] = text.split('::').map(part => part.trim());
            console.log('secret data:', firstVar);
            console.log('comment:', comment);
            await sendTelegramAlarm(`[${firstVar}] ${comment}`);
        }
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  rateProcess(); 
});
