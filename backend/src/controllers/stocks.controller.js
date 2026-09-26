const stockService = require("../services/stock.service");

const getStockSummary = async (req, res) => {
  try {
    const filters = {
      warehouseId: req.query.warehouseId,
      locationId: req.query.locationId,
      categoryId: req.query.categoryId,
      status: req.query.status,
      search: req.query.search,
    };

    const stockSummary = await stockService.getStockSummary(filters);

    return res.status(200).json({
      success: true,
      data: stockSummary,
    });
  } catch (error) {
    console.error("Error fetching stock summary:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock summary",
    });
  }
};

const getStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const stock = await stockService.getStockByProduct(productId);

    return res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching product stock:", error);

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product stock",
    });
  }
};

const getStockByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: "Location ID is required",
      });
    }

    const stock = await stockService.getStockByLocation(locationId);

    return res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching location stock:", error);

    if (error.message === "LOCATION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch location stock",
    });
  }
};

const getStockLedger = async (req, res) => {
  try {
    const filters = {
      productId: req.query.productId,
      warehouseId: req.query.warehouseId,
      locationId: req.query.locationId,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const ledger = await stockService.getStockLedger(filters);

    return res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    console.error("Error fetching stock ledger:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock ledger",
    });
  }
};

const createStockAdjustment = async (req, res) => {
  try {
    const {
      productId,
      locationId,
      countedQuantity,
      reason,
    } = req.body;

    if (!productId || !locationId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and location ID are required",
      });
    }

    if (
      countedQuantity === undefined ||
      countedQuantity === null ||
      Number.isNaN(Number(countedQuantity))
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid counted quantity is required",
      });
    }

    if (Number(countedQuantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Counted quantity cannot be negative",
      });
    }

    const adjustment = await stockService.createStockAdjustment({
      productId,
      locationId,
      countedQuantity: Number(countedQuantity),
      reason,
      userId: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Stock adjustment created successfully",
      data: adjustment,
    });
  } catch (error) {
    console.error("Error creating stock adjustment:", error);

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error.message === "LOCATION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create stock adjustment",
    });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const filters = {
      warehouseId: req.query.warehouseId,
      locationId: req.query.locationId,
      categoryId: req.query.categoryId,
    };

    const lowStockItems = await stockService.getLowStockItems(filters);

    return res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    console.error("Error fetching low-stock items:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock items",
    });
  }
};

module.exports = {
  getStockSummary,
  getStockByProduct,
  getStockByLocation,
  getStockLedger,
  createStockAdjustment,
  getLowStockItems,
};
