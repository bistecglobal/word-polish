const presetModel = require('./model');

const newData = new presetModel({
    promptPreset: [],

});

newData.save()
  .then(savedData => console.log('Data saved:', savedData))
  .catch(error => console.error('Error saving data:', error));
