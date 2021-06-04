
const path = require('path');
const fs = require('fs');

try {
  const data = fs.readFileSync( path.resolve(__dirname, '../../dist/bookmarklet.js'), 'utf8');
  module.exports = [
    {
      pattern: '###BOOKMARKLET###',
      replacement: data
    }
  ]
} catch (err) {
  console.error(err)
}
