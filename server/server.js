const express = require('express');
const app = express();
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  //when webpack builds bundle.js, statically serve it on the ./build route
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on root route
  app.get('/', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '../index.html'));
  });
}
app.listen(3000); //localhost:3000