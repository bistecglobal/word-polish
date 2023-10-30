const mongoose = require('mongoose');

const presetSchema = new mongoose.Schema({
  // Define your schema fields here
  promptPreset: [],

  // ...
});

const presetModel =  new mongoose.model('presetModel', presetSchema);

module.exports = presetModel;