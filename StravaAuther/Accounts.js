// Email for all accounts
const accounts = [
  'anygis0000+0@gmail.com',
  'anygis0000+1@gmail.com',
  'anygis0000+2@gmail.com',
  'anygis0000+3@gmail.com',
  'anygis0000+4@gmail.com',
  'anygis0000+5@gmail.com',
  'anygis0000+6@gmail.com',
  'anygis0000+7@gmail.com',
  'anygis0000+8@gmail.com',
  'anygis0000+9@gmail.com'
]

function getRandomAccount() {
  return accounts[Math.floor(Math.random() * accounts.length)]
}
// Password for all accounts
function getPass() {
  return 'AnyG15server'
}

module.exports.getRandomAccount = getRandomAccount
module.exports.getPass = getPass