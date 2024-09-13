import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const FIRST_PAGE = process.env.FIRST_PAGE ?? '';
const SECOND_PAGE = process.env.SECOND_PAGE ?? '';

const FIRST_TYPE = process.env.FIRST_TYPE ?? '';
const SECOND_TYPE = process.env.SECOND_TYPE ?? '';

const generateRandomCont = (): string => {
    return uuidv4(); 
};

async function rateProcess() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(FIRST_PAGE, { waitUntil: 'networkidle2' });

    await page.type(FIRST_TYPE, process.env.SECRET_ONE ?? '');
    await page.type(SECOND_TYPE, process.env.SECRET_TWO ?? '');

    await Promise.all([
      page.click(process.env.THIRD_TYPE ?? ''),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    await page.goto(SECOND_PAGE, { waitUntil: 'domcontentloaded' });
    console.log('page move complete.');

    const randomCont = generateRandomCont();

    const contSelector = process.env.FIRST_MEMO ?? '';
    await page.waitForSelector(contSelector);

    // prevent duplication
    const existingCont = await page.$eval(
        contSelector, (el: any) => el?.value
    );

    if (!existingCont) {
      await page.type(contSelector, randomCont);

      const secretSelector = process.env.FOURTH_TYPE ?? '';
      await page.click(secretSelector);

      console.log(`complate: ${randomCont}`);
    } else {
      console.log('already exists.');
    }

    // three second
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error('error:', error);
  } finally {
    await browser.close();
  }
}

export {
    rateProcess
};
