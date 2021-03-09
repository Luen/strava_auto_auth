const axios = require('axios')
const storage = require('./Storage')
const stravaAuther = require('./WebScraper')
const cookieParser = require('./CookieParser')
const accounts = require('./Accounts')

const AUTH_PARAMS_KEY = 'AUTH_PARAMS_KEY'

let isScraperIdle = true;

async function getStravaTileUrl(z, x, y, size = 512, mode = 'all', color = 'hot') {
  let url = ''
  if (z < 12) {
    url = createDirectURL(z, x, y, size, mode, color)
  } else {
    console.log('-------')
    let authParams = ''

    let storedAuthParamsObject = storage.load(AUTH_PARAMS_KEY)

    if (storedAuthParamsObject &&
      !storedAuthParamsObject.isError &&
      typeof storedAuthParamsObject.data !== 'undefined' &&
      storedAuthParamsObject.data) {

      const defaultUrl = defaultUrlForPinging(size, storedAuthParamsObject.data)
      const isOutdated = await isAuthParamsOutdated(defaultUrl)
      if (!isOutdated) {
        console.log('not outdated')
        authParams = storedAuthParamsObject.data
      } else {
        console.log('is outdated')
        authParams = null
      }
    } else {
      authParams = null
      if (storedAuthParamsObject && (storedAuthParamsObject.isError || !storedAuthParamsObject.data || typeof storedAuthParamsObject.data == 'undefined')) {
        console.error('storedAuthParamsObject error')
      } else {
        if (isScraperIdle) {
          console.log('No storedAuthParamsObject. Server just started?')
        }
      }
    }
    if (!isScraperIdle) {
      console.log('Getting auth params now. Please wait and try again in a few seconds.')
      return false
    }
    if (!authParams) {
      console.log('not authParams')

      let authParamsObject = await fetchAuthParamsWithRandomAccount()
      if (!authParamsObject.isError) {
        if (authParamsObject.data !== '') {
          authParams = authParamsObject.data
          console.log('authParams ok')
          //console.log(authParams)
        } else {
          console.log('parsed cookies is empty')
          return {
            isError: true,
            data: null
          }
        }
      } else {
        console.log('authParams error')
        return {
          isError: true,
          data: null
        }
      }
    }
    url = createURLWithAuthParams(z, x, y, size, mode, color, authParams)
  }
  console.log("Requested:", url)
  return {
    isError: false,
    data: url
  }
}

async function isAuthParamsOutdated(testHiResTileURL) {
  const options = {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'PostmanRuntime/7.26.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    }
  }
  return await axios
    .head(testHiResTileURL, options)
    .then(function(response) {
      return response.status != 200
    })
    .catch(function(error) {
      console.error('Pinging error - ', testHiResTileURL, error)
      return true;
    })
}

async function getContent(url) {
  const options = {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'PostmanRuntime/7.26.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    }
  }
  return await axios
    .get(url, options)
    .then(function(response) {
      console.log('Download ok - ', url)
      const buffer = Buffer.from(response.data, 'base64')
      return {
        isError: false,
        data: buffer
      }
    })
    .catch(function(error) {
      console.error('Download error - ', url)
      return {
        isError: true,
        data: ""
      }
    })
}

async function fetchAuthParamsWithRandomAccount() {
  return fetchAuthParams(accounts.getRandomAccount(), accounts.getPass())
}

async function fetchAuthParams(login, password) {
  if (isScraperIdle) {
    isScraperIdle = false
    const authedCookies = await stravaAuther.getCookies(login, password)
    let newAuthParams = cookieParser.parse(authedCookies)
    storage.save(AUTH_PARAMS_KEY, newAuthParams)
    isScraperIdle = true
    return {
      isError: false,
      data: newAuthParams
    }
  } else {
    console.log('Scraper is busy and is currently getting auth params.')
    /*return {
      isError: true,
      data: null
    }*/
  }
}

function createDirectURL(z, x, y, size, mode, color) {
  console.log(`https://heatmap-external-a.strava.com/tiles/${mode}/${color}/${z}/${x}/${y}.png?px=${size}`)
  return `https://heatmap-external-a.strava.com/tiles/${mode}/${color}/${z}/${x}/${y}.png?px=${size}`
}

function createURLWithAuthParams(z, x, y, size, mode, color, authParams) {
  console.log(`https://heatmap-external-a.strava.com/tiles-auth/${mode}/${color}/${z}/${x}/${y}.png?px=${size}${authParams}`)
  return `https://heatmap-external-a.strava.com/tiles-auth/${mode}/${color}/${z}/${x}/${y}.png?px=${size}${authParams}`
}

function defaultUrlForPinging(size, authParams) {
  return createURLWithAuthParams(13, 4953, 2546, size, 'all', 'hot', authParams)
}


module.exports.getStravaTileUrl = getStravaTileUrl
module.exports.fetchAuthParams = fetchAuthParams
module.exports.getContent = getContent