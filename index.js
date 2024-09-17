require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let urlDatabase = {};
let urlCounter = 0;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Handle the POST request to create a short URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Validate the URL format using regex
  const urlPattern = /^(https?:\/\/)(www\.)?[a-z0-9\-]+\.[a-z]{2,6}/i;
  if (!urlPattern.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Use DNS to check if the URL is reachable
  const host = new URL(url).host;
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // If valid, store the URL and create a short URL
    urlCounter++;
    urlDatabase[urlCounter] = url;
    return res.json({ original_url: url, short_url: urlCounter });
  });
});

// Redirect to the original URL when accessing the short URL
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.status(404).json({ error: 'short URL not found' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
