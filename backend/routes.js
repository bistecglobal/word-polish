const express = require('express');
const app = express();
const presetModel = require('./model');

app.post('/api/saveData', (req, res) => {
  const newData = new presetModel(req.body);

  newData.save()
    .then(savedData => {
      console.log('Data saved:', savedData);
      res.status(201).json(savedData); // Send a response back to the client
    })
    .catch(error => {
      console.error('Error saving data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

module.exports = router;
