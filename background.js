chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
  const action = message.action
  if (action === 'getToken') {
    getToken().then(result => sendResponse(result))
  }
  return true
})

async function getToken () {
  const cookies = await new Promise(resolve => chrome.cookies.getAll({ domain: 'live.com' }, cookies => resolve(cookies)))
  const token = cookies.filter(x => x.name === 'skypetoken' && x.value.startsWith('B'))[0].value.replace(/^Bearer%3D|%26O.+/g, '')
  return token
}
