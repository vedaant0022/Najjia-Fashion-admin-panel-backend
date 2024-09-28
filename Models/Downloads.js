const mongoose = require('mongoose');

const DownloadSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('Download', DownloadSchema);
