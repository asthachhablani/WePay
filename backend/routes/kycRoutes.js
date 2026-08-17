const express = require("express");

const {
  submitKYC,
} = require("../controllers/kycController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// =====================================================
// SUBMIT KYC
// =====================================================

router.post(
  "/submit",
  protect,
  upload.fields([
    {
      name: "panDocument",
      maxCount: 1,
    },
    {
      name: "aadhaarDocument",
      maxCount: 1,
    },
    {
      name: "bankStatement",
      maxCount: 1,
    },
  ]),
  submitKYC
);


module.exports = router;