/**
 * Chat Log Analyzer Controller
 * Handles file uploads and sentiment analysis
 */

const fs = require('fs').promises;
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

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
    const lines = fileContent.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File is empty'
      });
    }

    // Parse chat log
    const messages = parseMessages(lines);
    
    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid messages found in file'
      });
    }

    // Analyze messages
    const analysis = analyzeMessages(messages);

    // Send results
    res.json({
      success: true,
      totalMessages: analysis.totalMessages,
      totalUsers: analysis.uniqueUsers.size,
      mostActiveUser: analysis.mostActiveUser,
      mostActiveHour: analysis.mostActiveHour,
      topWords: analysis.topWords,
      sentimentBreakdown: analysis.sentiment,
      userActivity: Object.fromEntries(analysis.userActivity),
      hourlyDistribution: Object.fromEntries(analysis.hourlyDistribution)
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing file',
      error: error.message
    });
  }
};

/**
 * Parse messages from various chat log formats
 * Supports: HH:MM:SS - Username: Message
 *           [HH:MM:SS] Username: Message
 *           Username: Message
 */
function parseMessages(lines) {
  const messages = [];
  
  const timeRegex = /^[\[\d]|^\d{1,2}:\d{2}/;
  
  for (const line of lines) {
    try {
      let timestamp = null;
      let user = null;
      let text = null;

      // Try to extract timestamp and user
      if (line.includes(':')) {
        // Format: HH:MM:SS - Username: Message or [HH:MM:SS] Username: Message
        let cleanLine = line.replace(/^[\[\]]/, '').trim();
        
        // Extract time if present
        const timeMatch = cleanLine.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          timestamp = parseInt(timeMatch[1]);
          cleanLine = cleanLine.substring(timeMatch[0].length).trim();
          
          // Remove dash separator if present
          if (cleanLine.startsWith('-')) {
            cleanLine = cleanLine.substring(1).trim();
          }
        }

        // Extract user and message
        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex > 0) {
          user = cleanLine.substring(0, colonIndex).trim();
          text = cleanLine.substring(colonIndex + 1).trim();
        }
      }

      if (user && text) {
        messages.push({
          timestamp: timestamp || 0,
          user: user,
          text: text
        });
      }
    } catch (e) {
      // Skip lines that can't be parsed
      continue;
    }
  }

  return messages;
}

/**
 * Analyze messages for sentiment, activity, and patterns
 */
function analyzeMessages(messages) {
  const userActivity = new Map();
  const hourlyDistribution = new Map();
  const wordFrequency = new Map();
  const sentimentScores = [];
  const uniqueUsers = new Set();

  // Initialize hours 0-23
  for (let i = 0; i < 24; i++) {
    hourlyDistribution.set(i, 0);
  }

  // Process each message
  for (const msg of messages) {
    // Track users
    uniqueUsers.add(msg.user);
    userActivity.set(msg.user, (userActivity.get(msg.user) || 0) + 1);

    // Track hourly distribution
    const hour = msg.timestamp || 0;
    if (hour >= 0 && hour < 24) {
      hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
    }

    // Sentiment analysis
    const score = sentiment.analyze(msg.text);
    sentimentScores.push(score);

    // Extract words (basic word extraction)
    const words = msg.text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3); // Only words > 3 chars

    for (const word of words) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    }
  }

  // Get top words (excluding common words)
  const commonWords = new Set(['that', 'this', 'with', 'from', 'have', 'just', 'like', 'know', 'will', 'dont', 'your', 'their']);
  const topWords = Array.from(wordFrequency.entries())
    .filter(([word]) => !commonWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  // Find most active user
  let mostActiveUser = 'N/A';
  let maxMessages = 0;
  for (const [user, count] of userActivity) {
    if (count > maxMessages) {
      maxMessages = count;
      mostActiveUser = user;
    }
  }

  // Find most active hour
  let mostActiveHour = 0;
  let maxHourMessages = 0;
  for (const [hour, count] of hourlyDistribution) {
    if (count > maxHourMessages) {
      maxHourMessages = count;
      mostActiveHour = hour;
    }
  }

  // Calculate sentiment breakdown
  const positiveCount = sentimentScores.filter(s => s.score > 0).length;
  const negativeCount = sentimentScores.filter(s => s.score < 0).length;
  const neutralCount = sentimentScores.filter(s => s.score === 0).length;
  const total = sentimentScores.length || 1;

  return {
    totalMessages: messages.length,
    uniqueUsers,
    mostActiveUser,
    mostActiveHour,
    topWords,
    sentiment: {
      positive: Math.round((positiveCount / total) * 100),
      neutral: Math.round((neutralCount / total) * 100),
      negative: Math.round((negativeCount / total) * 100)
    },
    userActivity,
    hourlyDistribution
  };
}

module.exports = { analyzeChat };
