# Strava auto authorization tool

Forked from [https://github.com/nnngrach/strava_auto_auth](https://github.com/nnngrach/strava_auto_auth) (a supporting script for [AnyGIS Server](https://github.com/nnngrach/AnyGIS_server)) with the rate limiter removed. This script scrapes Strava authorization cookies to request Strava heatmap tiles at a high zoom level (max 16z). It is useful for mobile navigation apps, which can't log in with Strava web site as well as use with editing OpenStreetMap.

For browser emulation, this script uses a Headless Chrome Browser, managed with the Puppeteer Node.js library.

### Installation

```
git clone https://github.com/Luen/strava_auto_auth
npm install
npm start
```

### Usage

Request the Strava heatmap tiles by sending a simple GET request to the server and receive the tile in response.

The default request (mode: all, color: hot, size: 512px)
[http://localhost:4000/{z}/{x}/{y}](http://68.183.65.138:5050/7/22/50/512/all/hot)

Additional Parameters:

z, x, y:

- Tiles available from 0 to 16 zoom level.

Size:

- 256 or 512 pixels.

Mode:

- All [http://localhost:4000/{z}/{x}/{y}/{size}/all/{color}](http://68.183.65.138:5050/11/1856/1130/512/all/hot)

- Ride [http://localhost:4000/{z}/{x}/{y}/{size}/ride/{color}](http://68.183.65.138:5050/7/22/50/512/ride/hot)

- Run [http://localhost:4000/{z}/{x}/{y}/{size}/run/{color}](http://68.183.65.138:5050/7/22/50/512/run/hot)

- Water [http://localhost:4000/{z}/{x}/{y}/{size}/water/{color}](http://68.183.65.138:5050/7/22/50/512/water/hot)

- Winter [http://localhost:4000/{z}/{x}/{y}/{size}/winter/{color}](http://68.183.65.138:5050/7/22/50/512/winter/hot)

Color:

- Hot [http://localhost:4000/{z}/{x}/{y}/{size}/{mode}/hot](http://68.183.65.138:5050/7/22/50/512/all/hot)

- Blue [http://localhost:4000/{z}/{x}/{y}/{size}/{mode}/blue](http://68.183.65.138:5050/7/22/50/512/all/blue)

- Purple [http://localhost:4000/{z}/{x}/{y}/{size}/{mode}/purple](http://68.183.65.138:5050/7/22/50/512/all/purple)

- Gray [http://localhost:4000/{z}/{x}/{y}/{size}/{mode}/gray](http://68.183.65.138:5050/7/22/50/512/all/gray)

- Bluered [http://localhost:4000/{z}/{x}/{y}/{size}/{mode}/bluered](http://68.183.65.138:5050/7/22/50/512/all/bluered)

### Loading tiles

To load Strava heatmap tiles, you have two methods:
1. **Loading tiles with cookies**: Sending a GET request for Strava heatmap tile with the cookies. Here is the URL template for this request:
`GET https://heatmap-external-{abc}.strava.com/tiles-auth/all/hot/{z}/{x}/{y}.png?px=256`
2. **Loading tiles with HTTP parameters**: Parse JSON response to extract the CloudFront-Signature, CloudFront-Key-Pair-Id, CloudFront-Policy values. Then send a GET request with these values as parameters. Here is the URL template for this request:
`GET https://heatmap-external-{abc}.strava.com/tiles-auth/all/hot/{z}/{x}/{y}.png?px=256&Signature={CloudFront-Signature}&Key-Pair-Id={CloudFront-Key-Pair-Id}&Policy={CloudFront-Policy}`

This script works by redirctings to the tile with the request parameters.

### Fetching session cookies

Send to working container GET request with your Strava login and password. Like this:

`GET http://localhost:4000/StravaAuth/MyLogin/MyPassword`

This script can take up to 1 minute to respond. After that, you'll get a response message with JSON with all cookies data. Save them to persistent storage and use this for loading tiles later. When the current session expires and these cookies are no longer valid, just request new cookies again.
