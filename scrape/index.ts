import * as fs from "fs";
import * as superagent from "superagent";

const PATH = "data.json";
const URL = "https://www.unrealengine.com/marketplace/api/assets";

const main = async () => {
  await write("[");

  try {
    let count = 0;
    do {
      console.log(count);
      const response = await get(count);
      const results = response.body["data"]["elements"];
      await write(stringPayload(results));
      count += 100;
      sleep(1500);
    } while (count <= 11725);

    await write("]");
  } catch (e) {
    console.error(e);
  }
};

const get = (start: number) => {
  return superagent.get(`${URL}?start=${start}&count=100`);
};

const stringPayload = (contents: string) => {
  return `${JSON.stringify(contents).slice(1, -1)},\n`;
};

const write = (contents: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(PATH, Buffer.from(contents), { flag: "a" }, (e) => {
      if (e) reject(e);
      resolve();
    });
  });
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

main();
