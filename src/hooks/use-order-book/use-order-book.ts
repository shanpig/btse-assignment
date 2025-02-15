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
): [Record<number, number>, Set<number>, Set<number>, Set<number>] => {
  const newRecords = new Set<number>();
  const increasedRecords = new Set<number>();
  const decreasedRecords = new Set<number>();

  const records = orderList.reduce<Record<number, number>>((acc, [price, size]) => {
    const priceValue = parseFloat(price);
    const sizeValue = parseFloat(size);

    if (sizeValue === 0) {
      delete acc[priceValue];
    } else {
      if (!acc[parseFloat(price)]) {
        newRecords.add(parseFloat(price));
      } else if (acc[parseFloat(price)] > parseFloat(size)) {
        decreasedRecords.add(parseFloat(price));
      } else {
        increasedRecords.add(parseFloat(price));
      }

      acc[parseFloat(price)] = parseFloat(size);
    }
    return acc;
  }, defaultOrderBook || {});

  return [records, newRecords, increasedRecords, decreasedRecords];
};

const useOrderBook = (props?: UseOrderBookProps) => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: {}, asks: {} });
  const [highlightedQuotes, setHighlightedQuotes] = useState(new Set<number>());
  const [highlightedQuoteIncreases, setHighlightedQuoteIncreases] = useState(new Set<number>());
  const [highlightedQuoteDecreases, setHighlightedQuoteDecreases] = useState(new Set<number>());

  const lastSeqNum = useRef<number | null>(null);

  const initializeOrderBook = useCallback((data: OrderBookSchema) => {
    console.warn("initialize order book");
    lastSeqNum.current = data.data.seqNum;

    const [newBids] = parseOrderTuple(data.data.bids);
    const [newAsks] = parseOrderTuple(data.data.asks);

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

      const [updatedBids, highlightedBids, highlightedBidIncreases, highlightedBidDecreases] = parseOrderTuple(
        data.data.bids,
        {
          ...orderBook.bids,
        }
      );
      const [updatedAsks, highlightedAsks, highlightedAskIncreases, highlightedAskDecreases] = parseOrderTuple(
        data.data.asks,
        {
          ...orderBook.asks,
        }
      );

      setOrderBook({ bids: updatedBids, asks: updatedAsks });
      setHighlightedQuotes(highlightedBids.union(highlightedAsks));
      setHighlightedQuoteIncreases(highlightedBidIncreases.union(highlightedAskIncreases));
      setHighlightedQuoteDecreases(highlightedBidDecreases.union(highlightedAskDecreases));

      setTimeout(() => {
        setHighlightedQuotes(new Set());
        setHighlightedQuoteIncreases(new Set());
        setHighlightedQuoteDecreases(new Set());
      }, 100);
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
    highlightedQuotes,
    highlightedQuoteIncreases,
    highlightedQuoteDecreases,
  };
};

export default useOrderBook;
