import { TOPPINGS, CANDLES, SPARKLERS, findById } from "../data/cakeOptions";

const BASE_PRICE = 1200;

export function priceForCake(cake, options = null) {
  let total = BASE_PRICE;
  if (!cake) return total;
  if (cake.shape) total += cake.shape.price || 0;
  if (cake.flavor) total += cake.flavor.price || 0;
  if (cake.layers) total += cake.layers.price || 0;
  if (cake.fondant) total += cake.fondant.price || 0;
  if (cake.frosting) total += cake.frosting.price || 0;

  if (cake.toppings && cake.toppings.length > 0) {
    total += cake.toppings.reduce((sum, t) => {
      const def = (options?.toppings && findById(options.toppings, t.toppingId)) || findById(TOPPINGS, t.toppingId);
      return sum + (def?.price || 0);
    }, 0);
  }

  if (cake.candles && cake.candles.length > 0) {
    const candlesList = options?.candles || CANDLES;
    const sparklersList = options?.sparklers || SPARKLERS;
    total += cake.candles.reduce((sum, c) => {
      const def = findById(candlesList, c.candleId) || findById(sparklersList, c.candleId) || findById(CANDLES, c.candleId) || findById(SPARKLERS, c.candleId);
      return sum + (def?.price || 0);
    }, 0);
  }

  return total;
}

export function formatPKR(amount) {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}
