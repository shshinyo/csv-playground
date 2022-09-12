import { IProduct } from "./models/product.model";
const fs = require("fs");
const { parse } = require("csv-parse");
const fastcsv = require("fast-csv");
let inputFile = process.argv[2];

const handleOrders = parse(
  { columns: true },
  (err: Error, records: Array<IProduct>) => {
    let ordersDic: any = {};
    if (records.length <= 1 || records.length > 10000) {
      // Constraints
      console.log("orders length must be greater than 1 and lower than 10000");
      return false;
    }
    buildOrdersDic(records, ordersDic);
    let firstFileOutput = Object.keys(ordersDic).map((key) => ({
      productName: key,
      average: ordersDic[key].productOrdersCount / records.length,
    }));
    let secondFileOutput = Object.keys(ordersDic).map((key) => ({
      productName: key,
      Brand: Object.keys(ordersDic[key].orders).sort(
        (a, b) => a.length - b.length
      )[0],
    }));
    writeFile(`0_${inputFile}`, firstFileOutput);
    writeFile(`1_${inputFile}`, secondFileOutput);
  }
);

const buildOrdersDic = (records, ordersDic) => {
  records.forEach((order: IProduct, index: number) => {
    if (!ordersDic[`${order.Name}`]) {
      ordersDic[`${order.Name}`] = {
        orders: { [order.Brand]: [order] },
        productOrdersCount: +order.Quantity,
      };
    } else {
      ordersDic[`${order.Name}`].orders[`${order.Brand}`]
        ? ordersDic[`${order.Name}`].orders[`${order.Brand}`].push(order)
        : (ordersDic[`${order.Name}`].orders[`${order.Brand}`] = [order]);
      ordersDic[`${order.Name}`].productOrdersCount += +order.Quantity;
    }
  });
};
const writeFile = (path, data) => {
  const ws = fs.createWriteStream(`output/${path}`);
  fastcsv.write(data, { headers: true }).pipe(ws);
};

if (inputFile && inputFile.match(/.*\.csv/)) {
  fs.createReadStream(__dirname + `/${inputFile}`).pipe(handleOrders);
} else console.log("Bad input File");
