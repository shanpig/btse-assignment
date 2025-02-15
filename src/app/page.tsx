"use client";
import useLastPrice from "./hooks/use-last-price";
import useOrderBook from "./hooks/use-order-book";

export default function Home() {
  // const { lastPrice, trend } = useLastPrice();
  // const { orderBook } = useOrderBook();

  return (
    <div>
      {/* {lastPrice}, {trend > 0 ? "up" : trend < 0 ? "down" : "none"} */}
      {Object.entries(orderBook.bids)
        .slice(0, 8)
        .sort(([priceLeft], [priceRight]) => parseFloat(priceRight) - parseFloat(priceLeft))
        .map(([price, size]) => (
          <div key={price}>
            {parseFloat(price).toFixed(1)}, {size.toFixed(0)}
          </div>
        ))}
      <hr />
      {Object.entries(orderBook.asks)
        .slice(0, 8)
        .sort(([priceLeft], [priceRight]) => parseFloat(priceRight) - parseFloat(priceLeft))
        .map(([price, size]) => (
          <div key={price}>
            {parseFloat(price).toFixed(1)}, {size.toFixed(0)}
          </div>
        ))}
    </div>
  );
}
