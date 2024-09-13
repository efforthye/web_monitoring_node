import axios from 'axios';
import * as cheerio from 'cheerio';

interface SecretCounts {
  prevTitCount: string | null;
  prevContCount: string | null;
}

const secretCountsMap: Map<string, SecretCounts> = new Map();

const fetchCounts = async ({secretData}: {secretData: string}): Promise<string> => {
  const urlPost = `${process.env.SECRET_SITE}/${secretData}`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
  };

  try {
    const getResult = await axios.get(urlPost, { headers });
    const $ = cheerio.load(getResult.data);

    const titCountElement = $('h2.tit').first();
    let titCount: string;
    if (titCountElement.length > 0) {
      const titCountText = titCountElement.text().trim();
      titCount = titCountText.split("(").pop()?.split(")")[0] ?? "0";
    } else {
      titCount = "titel ement not found.";
    }

    const contCountElement = $('.cont_head.clear').eq(1);
    let contCount: string;
    if (contCountElement.length > 0) {
      const contCountText = contCountElement.text().trim();
      contCount = contCountText.split("(").pop()?.split(")")[0] ?? "0";
    } else {
      contCount = "contel ement not found.";
    }

    // Get or initialize user-specific counts
    let secretCounts = secretCountsMap.get(secretData);
    if (!secretCounts) {
      secretCounts = { prevTitCount: null, prevContCount: null };
      secretCountsMap.set(secretData, secretCounts);
    }

    let text: string | undefined;
    // log output if changed compared to previous value
    if (secretCounts.prevTitCount !== null && secretCounts.prevContCount !== null) {
      if (secretCounts.prevTitCount !== titCount || secretCounts.prevContCount !== contCount) {
        if (secretCounts.prevTitCount !== titCount && secretCounts.prevContCount !== contCount) {
          text = `${secretData}: tit is ${secretCounts.prevTitCount} to ${titCount}, cont is ${secretCounts.prevContCount} to ${contCount}`;
        } else if (secretCounts.prevTitCount !== titCount) {
          const newPrevTitCount = +(secretCounts.prevTitCount.replace(/,/g, ''));
          const newPostCount = +(titCount.replace(/,/g, ''));
          if (newPrevTitCount < newPostCount) text = `${secretData}:: tit ${newPostCount - newPrevTitCount} plus count.`;
          if (newPrevTitCount > newPostCount) text = `${secretData}:: tit ${newPrevTitCount - newPostCount} minus count.`;
        } else if (secretCounts.prevContCount !== contCount) {
          const newPrevContCount = +(secretCounts.prevContCount.replace(/,/g, ''));
          const newCommentCount = +(contCount.replace(/,/g, ''));
          if (newPrevContCount < newCommentCount) text = `${secretData}:: cont ${newCommentCount - newPrevContCount} plus count.`;
          if (newPrevContCount > newCommentCount) text = `${secretData}:: cont ${newPrevContCount - newCommentCount} minus count.`;
        }
      }
    }

    // update changed information
    secretCounts.prevTitCount = titCount;
    secretCounts.prevContCount = contCount;

    if (text) return text;

    // output the current number of data
    const now = new Date();
    const nowTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    return `[${nowTime}-${secretData}] tit count: ${titCount}, cont count: ${contCount}`;

  } catch (error) {
    console.error({error});
    return "An error occurred while retrieving data.";
  }
};

export {
    fetchCounts
}