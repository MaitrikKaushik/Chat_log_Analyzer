/**
 * Chat Log Analyzer Controller
 * Handles file uploads and sentiment analysis
 */

const analyzeService = require('../services/analyzeService');

// Analyze chat log file
const analyzeChat = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Read the uploaded file
    const fileContent = req.file.buffer.toString('utf8');

    // Let the Service Layer handle the business logic
    const result = analyzeService.processChatLog(fileContent);

    // Send results back to client
    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Catch specific service validation errors
    if (error.message === 'File is empty' || error.message === 'No valid messages found in file') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error analyzing file',
      error: error.message
    });
  }
};

module.exports = { analyzeChat };
