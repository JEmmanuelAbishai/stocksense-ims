const express = require("express");

const {
  getStockSummary,
  getStockByProduct,
  getStockByLocation,
  getStockLedger,
  createStockAdjustment,
  getLowStockItems,
} = require("../controllers/stocks.controller");

const router = express.Router();

router.get("/", getStockSummary);

router.get("/product/:productId", getStockByProduct);

router.get("/location/:locationId", getStockByLocation);

router.get("/ledger", getStockLedger);

router.post("/adjustments", createStockAdjustment);

router.get("/low-stock", getLowStockItems);

module.exports = router;
