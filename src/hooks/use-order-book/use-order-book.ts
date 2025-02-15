import { useCallback, useEffect, useRef, useState } from "react";
import { OrderBook, OrderBookSchema, orderBookSchema, UseOrderBookProps } from "./use-order-book.type";
import { ORDER_BOOK_MOCK } from "./use-order-book.constants";

const TOPIC = "update:BTCPFC";
const socket = new WebSocket("wss://ws.btse.com/ws/oss/futures");

const subscribe = () => {
  socket.send(
    JSON.stringify({
      op: "subscribe",
      args: [TOPIC],
    })
  );
};

const unsubscribe = () => {
  socket.send(
    JSON.stringify({
      op: "unsubscribe",
      args: [TOPIC],
    })
  );
};

const parseOrderTuple = (
  orderList: Array<[string, string]>,
  defaultOrderBook?: Record<number, number>
): Record<number, number> => {
  return orderList.reduce<Record<number, number>>((acc, [price, size]) => {
    const priceValue = parseFloat(price);
    const sizeValue = parseFloat(size);

    if (sizeValue === 0) {
      delete acc[priceValue];
    } else {
      acc[parseFloat(price)] = parseFloat(size);
    }
    return acc;
  }, defaultOrderBook || {});
};

const useOrderBook = (props?: UseOrderBookProps) => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: {}, asks: {} });
  const lastSeqNum = useRef<number | null>(null);

  const initializeOrderBook = useCallback((data: OrderBookSchema) => {
    console.warn("initialize order book");
    lastSeqNum.current = data.data.seqNum;

    const newBids = parseOrderTuple(data.data.bids);
    const newAsks = parseOrderTuple(data.data.asks);

    setOrderBook({ bids: newBids, asks: newAsks });
  }, []);

  const resubscribe = useCallback(() => {
    console.log("resubscribe");
    unsubscribe();
    subscribe();
  }, []);

  const updateOrderBook = useCallback(
    (data: OrderBookSchema) => {
      lastSeqNum.current = data.data.seqNum;
      console.log("updateOrderBook");

      const newBids = parseOrderTuple(data.data.bids, { ...orderBook.bids });
      const newAsks = parseOrderTuple(data.data.asks, { ...orderBook.asks });

      setOrderBook({ bids: newBids, asks: newAsks });
    },
    [orderBook]
  );

  const checkCrossBook = useCallback(() => {
    console.log("checkCrossBook");
    const bestBid = Math.max(...Object.keys(orderBook.bids).map(Number), 0);
    const bestAsk = Math.min(...Object.keys(orderBook.asks).map(Number), Infinity);

    if (bestBid >= bestAsk) {
      console.warn("Crossed order book detected!");
      console.warn("bestBid: ", bestBid);
      console.warn("bestAsk: ", bestAsk);
      console.warn("orderBook: ", orderBook);
      resubscribe();
    }
  }, [orderBook, resubscribe]);

  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      const { success, data } = orderBookSchema.safeParse(JSON.parse(event.data));

      if (success) {
        if (data.data.type === "snapshot") {
          initializeOrderBook(data);
        } else {
          const isSeqMismatch = lastSeqNum.current !== data.data.prevSeqNum;
          if (isSeqMismatch) {
            console.warn("sequence mismatch!");
            console.warn("previous sequence: ", lastSeqNum.current);
            console.warn("previous sequence check: ", data.data.prevSeqNum);
            console.warn("new sequence: ", data.data.seqNum);
            resubscribe();
          } else {
            updateOrderBook(data);
            checkCrossBook();
          }
        }
      }
    },
    [checkCrossBook, initializeOrderBook, resubscribe, updateOrderBook]
  );

  useEffect(() => {
    if (!props?.mock) {
      socket.addEventListener("open", subscribe);
      socket.addEventListener("message", handleSocketMessage);
    }

    return () => {
      socket.removeEventListener("open", subscribe);
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [handleSocketMessage, props?.mock]);

  return {
    orderBook: props?.mock ? ORDER_BOOK_MOCK : orderBook,
  };
};

export default useOrderBook;
