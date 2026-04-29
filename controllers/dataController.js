/**
 * Data Controller – File Operations
 * (unchanged from Phase 1, kept for continuity)
 */

const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.txt');

const readFile = (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ success: false, message: 'data.txt not found' });
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    res.json({ success: true, content, size: content.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const writeFile = (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: '"content" is required' });
    fs.writeFileSync(DATA_FILE, content, 'utf8');
    res.json({ success: true, message: 'File written', bytes: content.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const streamFile = (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(404).json({ success: false, message: 'data.txt not found' });
  }
  res.setHeader('Content-Type', 'text/plain');
  const stream = fs.createReadStream(DATA_FILE);
  stream.pipe(res);
  stream.on('error', (err) => res.status(500).end(err.message));
};

module.exports = { readFile, writeFile, streamFile };
