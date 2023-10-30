// const express = require("express");
// const app = express();

// //Server code

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// //set up Azure storage connection
// const { BlobServiceClient, BlobServiceClient } = require("@azure/storage-blob");
// const BlobServiceClient = BlobServiceClient.fromConnectionString("your_connection_string");

// app.post("/upload", async (req, res) => {
//   const containerClient = BlobServiceClient.getContainerClient("your_container_name");
//   const blockBlobClient = containerClient.getBlockClient("your_blob_name");

//   const stream = req.filter.buffer; //Assuming you're handling file uploads
//   const uploadResponse = await blockBlobClient.uploadStream(stream, stream.byteLength);

//   res.json({ url: uploadResponse.url });
// });

// app.get("/retrieve", async (req, res) => {
//   const containerClient = blobServiceClient.getContainerClient("your_container_name");
//   const blockBlobClient = containerClient.getBlockBlobClient("your_blob_name");

//   const downloadResponse = await blockBlobClient.download();
//   const downloadedContent = await streamToString(downloadResponse.readableStreamBody);

//   res.json({ data: downloadedContent });
// });

// async function streamToString(readableStream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     readableStream.on("data", (data) => {
//       chunks.push(data.toString());
//     });
//     readableStream.on("end", () => {
//       resolve(chunks.join(""));
//     });
//     readableStream.on("error", reject);
//   });
// }
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes');

// Configure bodyParser to parse JSON
app.use(bodyParser.json());

// Connect to MongoDB
const DB_URL = 'mongodb+srv://lahirujeewantha321:lahirujeewantha321@msworddb.ond2hi8.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(error => console.error('Error connecting to MongoDB Atlas:', error));

// Use the routes
app.use('/api', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






 