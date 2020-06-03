import * as fs from "fs";
const PATH = "data.json";
const CLEAN_PATH = "clean.json";

class Filter {
  id: string;
  title: string;
  description: string;
  urlSlug: string;

  price: string;

  priceValue: number;
  discountPriceValue: number;
  discountPercentage: number;

  discountPrice: string;
  featured: string;
  thumbnail: string;
  rating: any;

  compatibleApps: any;
  categories: any;

  isNew: boolean;
  free: boolean;
  discounted: boolean;
}

const main = async () => {
  try {
    const a = await read();
    const b = JSON.parse(a);
    const c = b.map((item) => {
      return {
        id: item?.id,
        title: item?.title,
        description: item?.description,
        urlSlug: item?.urlSlug,
        price: item?.price,
        priceValue: item?.priceValue,
        discountPriceValue: item?.discountPriceValue,
        discountPercentage: item?.discountPercentage,
        discountPrice: item?.discountPrice,
        featured: item?.featured,
        thumbnail: item?.thumbnail,
        rating: item?.rating,
        compatibleApps: item?.compatibleApps,
        categories: item?.categories,
        isNew: item?.isNew,
        free: item?.free,
        discount: item?.discounted,
        effectiveDate: item?.effectiveDate,
      };
    });

    console.log(c);
    await write(c);
  } catch (e) {
    console.error(e);
  }
};

const write = (contents: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      CLEAN_PATH,
      Buffer.from(JSON.stringify(contents)),
      { flag: "a" },
      (e) => {
        if (e) reject(e);
        resolve();
      }
    );
  });
};

const read = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH, (e, data) => {
      if (e) reject(e);
      resolve(data.toString("utf-8"));
    });
  });
};

main();
