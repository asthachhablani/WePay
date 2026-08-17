const Document = require("../models/Document");

// Add Document
const addDocument = async (req, res) => {
  try {
    const {
      documentType,
      fileUrl,
    } = req.body;

    const userId = req.user.userId;

    // Check required fields
    if (!documentType || !fileUrl) {
      return res.status(400).json({
        message: "Please provide all document details",
      });
    }

    // Create document
    const document = await Document.create({
      user: userId,
      documentType,
      fileUrl,
    });

    res.status(201).json({
      message: "Document added successfully",
      document: {
        id: document._id,
        documentType: document.documentType,
        verificationStatus: document.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Document error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addDocument,
};