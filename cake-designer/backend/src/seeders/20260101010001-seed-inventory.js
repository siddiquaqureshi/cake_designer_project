"use strict";
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("cake_bases", [
      { shape: "Round", base_price: 1200 },
      { shape: "Square", base_price: 1350 },
      { shape: "Rectangle", base_price: 1450 },
      { shape: "Heart", base_price: 1600 },
      { shape: "Triangle", base_price: 1500 }
    ]);

    await queryInterface.bulkInsert("flavors", [
      { name: "Vanilla", type: "classic", price_modifier: 0 },
      { name: "Chocolate Truffle", type: "classic", price_modifier: 200 },
      { name: "Red Velvet", type: "classic", price_modifier: 250 },
      { name: "Strawberry", type: "fruit", price_modifier: 200 },
      { name: "Butterscotch", type: "classic", price_modifier: 220 },
      { name: "Blueberry", type: "fruit", price_modifier: 230 },
      { name: "Mango", type: "fruit", price_modifier: 220 },
      { name: "Pistachio", type: "nutty", price_modifier: 260 },
    ]);

    await queryInterface.bulkInsert("fondant_options", [
      { color_name: "No Fondant (Buttercream finish)", hex_code: null, price_modifier: 0 },
      { color_name: "Blush Pink", hex_code: "#F3B6C6", price_modifier: 500 },
      { color_name: "Ivory", hex_code: "#FBF3E3", price_modifier: 500 },
      { color_name: "Mint", hex_code: "#BFE3CE", price_modifier: 550 },
      { color_name: "Lilac", hex_code: "#D9C7EE", price_modifier: 550 },
      { color_name: "Charcoal", hex_code: "#4B4750", price_modifier: 600 },
    ]);

    await queryInterface.bulkInsert("frosting_options", [
      { name: "Whipped Cream", texture_type: "smooth", price_modifier: 150 },
      { name: "Chocolate Ganache", texture_type: "glossy-drip", price_modifier: 250 },
      { name: "Caramel Drip", texture_type: "glossy-drip", price_modifier: 250 },
      { name: "Oreo Cream", texture_type: "flecked", price_modifier: 220 },
    ]);

    await queryInterface.bulkInsert("toppings", [
      { name: "Sprinkles", stock_quantity: 5000, price_per_item: 5 },
      { name: "Strawberry Piece", stock_quantity: 300, price_per_item: 60 },
      { name: "Fresh Berries", stock_quantity: 300, price_per_item: 70 },
      { name: "Mango Chunk", stock_quantity: 300, price_per_item: 50 },
      { name: "Candy Bar Piece", stock_quantity: 300, price_per_item: 90 },
    ]);

    await queryInterface.bulkInsert("candle_options", [
      { type: "Candle", color_style: "Classic Twist", price_per_item: 50 },
      { type: "Candle", color_style: "Golden Curly", price_per_item: 90 },
      { type: "Sparkler", color_style: "Gold Sparkler", price_per_item: 120 },
    ]);

    await queryInterface.bulkInsert("coupons", [
      { code: "SWEET10", discount_percentage: 10, expiry_date: "2027-12-31", is_active: true },
      { code: "CAKE20", discount_percentage: 20, expiry_date: "2027-12-31", is_active: true },
      { code: "FIRSTBAKE", discount_percentage: 15, expiry_date: "2027-12-31", is_active: true },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("coupons", null, {});
    await queryInterface.bulkDelete("candle_options", null, {});
    await queryInterface.bulkDelete("toppings", null, {});
    await queryInterface.bulkDelete("frosting_options", null, {});
    await queryInterface.bulkDelete("fondant_options", null, {});
    await queryInterface.bulkDelete("flavors", null, {});
    await queryInterface.bulkDelete("cake_bases", null, {});
  },
};
