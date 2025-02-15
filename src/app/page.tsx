"use client";

import useLastPrice from "../hooks/use-last-price";
import useOrderBook from "../hooks/use-order-book";
import ArrowDownIcon from "@/icons/icon-arrow-down.svg";
import { OrderBookRecordType } from "./page.type";

const parseOrderBookRecords = (records: Record<number, number>, accumulativeDirection: "toHighest" | "toLowest") => {
  const highestFirstRecordsSlice = Object.entries(records)
    .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
    .slice(0, 8);

  return accumulativeDirection === "toHighest"
    ? highestFirstRecordsSlice
        .reverse()
        .reduce<OrderBookRecordType[]>((acc, cur) => {
          const record = {
            price: parseFloat(cur[0]),
            size: cur[1],
            total: (acc.at(-1)?.total || 0) + cur[1],
          };
          acc.push(record);
          return acc;
        }, [])
        .reverse()
    : highestFirstRecordsSlice.reduce<OrderBookRecordType[]>((acc, cur) => {
        const record = {
          price: parseFloat(cur[0]),
          size: cur[1],
          total: (acc.at(-1)?.total || 0) + cur[1],
        };
        acc.push(record);
        return acc;
      }, []);
};

export default function Home() {
  const { lastPrice, trend } = useLastPrice();
  const { orderBook } = useOrderBook({ mock: true });

  const trendColor =
    trend > 0 ? "text-systemGreen bg-systemGreen-12" : trend < 0 ? "text-systemRed bg-systemRed-12" : "";

  const asks = parseOrderBookRecords(orderBook.asks, "toHighest");
  const bids = parseOrderBookRecords(orderBook.bids, "toLowest");

  return (
    <div className="py-2 w-72 font-extrabold border-black border-2">
      <h1 className="text-xl px-2 pb-2">Order Book</h1>

      <hr className="border-systemGray opacity-20" />

      <div className="px-2 py-2 grid grid-cols-3 text-systemGray font-normal">
        <span>Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* ASKS */}
      <div className="flex flex-col px-2 gap-0.5">
        {asks.map(({ price, size, total }) => (
          <div key={price} className="grid grid-cols-3 hover:bg-systemBlue">
            <span className="text-systemRed">
              {price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-right">{size.toLocaleString()}</span>
            <span className="text-right">{total.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* LAST PRICE */}
      <div className={`${trendColor} py-1 my-1 flex items-center justify-center gap-2 text-2xl`}>
        {lastPrice.toLocaleString()}

        {trend !== 0 && <ArrowDownIcon className={trend > 0 ? "rotate-180 " : ""}></ArrowDownIcon>}
      </div>

      {/* BIDS */}
      <div className="flex flex-col px-2 gap-0.5">
        {bids.map(({ price, size, total }) => (
          <div key={price} className="grid grid-cols-3 hover:bg-systemBlue">
            <span className="text-systemGreen">
              {price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-right">{size.toLocaleString()}</span>
            <span className="text-right">{total.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
