const puppeteer = require('puppeteer')

//https://github.com/vercel/vercel/discussions/4903

async function getCookies(login, password) {

  // 'headless': false,
  const herokuDeploymentParams = {
    'args': ['--no-sandbox', '--disable-setuid-sandbox']
  }
  const browser = await puppeteer.launch(herokuDeploymentParams)

  // console.log('Browser start')

  // Authorization on www.strava.com/login
  const page1 = await browser.newPage()
  await page1.setViewport({
    width: 1280,
    height: 1024
  })
  await page1.setDefaultNavigationTimeout(0);

  await page1.goto('https://www.strava.com/login', {
    waitUntil: 'networkidle2'
  })
  // await page1.screenshot({path: '01_login_page_loaded.png'});

  await page1.waitForSelector('form')
  await page1.type('input#email', login)
  await page1.type('input#password', password)
  // await page1.screenshot({path: '02_login_and_password_inserted.png'});

  await page1.waitFor(200)
  await page1.evaluate(() => document
    .querySelector('button#login-button')
    .click()
  )
  await page1.waitForNavigation()
  // await page1.screenshot({path: '03_redirected_to_new_page.png'});

  // We extract _strava4_session cookie
  const sessionFourCookie = await page1.cookies()
  // console.log(sessionFourCookie)
  // console.log("================================")

  // Authorization on heatmap-external-a.strava.com/auth
  const page2 = await browser.newPage()
  await page2.setCookie(...sessionFourCookie)
  await page2.goto('https://heatmap-external-a.strava.com/auth')

  // We extract the augmented CloudFront cookies
  const cloudfontCookie = await page2.cookies()
  // await page2.screenshot({path: '04_redirected_to_heatmap_page.png'});
  // console.log(cloudfontCookie)

  // console.log('Browser end')

  await browser.close()
  return cloudfontCookie
}

module.exports.getCookies = getCookies