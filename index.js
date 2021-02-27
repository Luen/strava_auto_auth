const express = require('express')
//const rateLimit = require('express-rate-limit')
const auther = require('./StravaAuther/StravaAuther')

// Server start
const PORT = process.env.PORT || 4000
const app = express()

// Limit the number of simultaneous connections to 1 per minute
// so that several Chrome does not start at once, which will clog all the memory
/*const limiter = rateLimit({
  windowMs: 20 * 1000,
  max: 1
})
app.use(limiter);*/

app.listen(PORT, () => {
  console.log('Listening on port ', PORT)
})


app.get('/', async (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })
  res.end('AnyGIS auto authorization script for Strava Heatmap')
})


// Redirect to the URL of the tile with the session parameters
app.get('/:z/:x/:y', async (req, res, next) => {
  const z = req.params.z
  const x = req.params.x
  const y = req.params.y

  if (!isInt(z)) return next(error(400, 'Z must be Intager'))
  if (z > 16) return next(error(400, 'Z must be greater than 16'))
  if (!isInt(x)) return next(error(400, 'X must be Intager'))
  if (!isInt(y)) return next(error(400, 'Y must be Intager'))

  let urlWithAuthParams = await auther.getStravaTileUrl(z, x, y)

  if (urlWithAuthParams) {
    if (!urlWithAuthParams.isError) {
      res.redirect(urlWithAuthParams.data)
    } else {
      console.error('Internal script error');
      res.status(500).send('Internal script error');
    }
  } else {
    res.status(500).send('Scraper busy getting auth params.');
  }
})

// Redirect to the URL of the tile with the session parameters
app.get('/:z/:x/:y/:size/:mode/:color', async (req, res, next) => {
  const z = req.params.z
  const x = req.params.x
  const y = req.params.y
  const size = req.params.size
  const mode = req.params.mode
  const color = req.params.color

  if (!isInt(z)) return next(error(400, 'Z must be Intager'))
  if (z > 16) return next(error(400, 'Z must be greater than 16'))
  if (!isInt(x)) return next(error(400, 'X must be Intager'))
  if (!isInt(y)) return next(error(400, 'Y must be Intager'))
  if (!isInt(size)) return next(error(400, 'Size must be Intager'))
  if (!mode) return next(error(400, 'No mode paramerer'))
  if (!color) return next(error(400, 'No color paramerer'))

  let urlWithAuthParams = await auther.getStravaTileUrl(z, x, y, size, mode, color)

  if (!urlWithAuthParams.isError) {
    res.redirect(urlWithAuthParams.data)
  } else {
    res.status(500).send('Internal script error');
  }
})

app.get('/StravaAuth/:login/:password/', async (req, res, next) => {
  const login = req.params.login
  const password = req.params.password
  if (!login) return next(error(400, 'No login paramerer'))
  if (!password) return next(error(400, 'No password paramerer'))

  const authedCookies = await auther.fetchAuthParams(login, password)
  res.end(authedCookies.data)
  // res.json(authedCookies);
})

// Secondary functions
function makeResponseFrom(result, res, next) {
  if (result.isError) {
    return next(error(500, 'Error with downloading tile'))
  } else {
    const imageBuffer = result.data

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length
    })

    return res.end(imageBuffer)
  }
}

function isInt(value) {
  var x = parseFloat(value)
  return !isNaN(value) && (x | 0) === x
}

function error(status, msg) {
  console.error("Error", msg);
  var err = new Error(msg)
  err.status = status
  return err
}