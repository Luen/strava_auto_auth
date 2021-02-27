const NodeCache = require("node-cache")

const storingTime = 24 * 3600 // 24 hours in seconds
const myCache = new NodeCache({
  stdTTL: storingTime,
  checkperiod: storingTime + 60
})

function save(name, data) {
  const object = {
    isError: false,
    data: data
  }
  try {
    const isSuccess = myCache.set(name, object, storingTime)
  } catch (err) {
    console.error("Error saving cache")
  }
}

function load(name) {
  try {
    //const object = myCache.get(name, true)
    const object = myCache.get(name)
    //if (!object) {
    //  console.error("No cache object found")
    //}
    return object
  } catch (err) {
    console.error("Load from cache error")
    const errorObject = {
      isError: true,
      data: ""
    }
    return errorObject
  }
}

module.exports.save = save
module.exports.load = load