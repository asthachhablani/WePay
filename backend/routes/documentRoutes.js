const express = require("express");
const { addDocument } = require("../controllers/documentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add Document - Protected
router.post("/add", protect, addDocument);

module.exports = router;