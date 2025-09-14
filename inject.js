const extensionID = document.getElementById('teamsAutomaticReply').outerText
// 发送到后台
const sendBackground = data =>
  new Promise(resolve =>
    chrome.runtime.sendMessage(extensionID, data, res => {
      resolve(res)
    })
  )

let state = false

const delay = () => new Promise(resolve => setTimeout(resolve, 1000))

function init () {
  const body = document.querySelector('body')
  // 按钮 CSS 样式
  const style = 'top:10px;right:100px;auto;z-index:1;position:fixed;width:80px;height:30px;color:white;border:1px solid #d1d1d1;border-radius:4px;'
  // 插入开始按钮
  const startButton = document.createElement('button')
  startButton.setAttribute('id', 'startBtn')
  startButton.setAttribute('style', style + 'background:#13a10e;')
  const startNode = document.createTextNode('开始')
  startButton.appendChild(startNode)
  body.appendChild(startButton)
  // 插入停止按钮
  const stopButton = document.createElement('button')
  stopButton.setAttribute('id', 'stopBtn')
  stopButton.setAttribute('style', style + 'background:#d13438;display:none;')
  const stopNode = document.createTextNode('停止')
  stopButton.appendChild(stopNode)
  body.appendChild(stopButton)

  // 开始循环
  startButton.addEventListener('click', async () => {
    const status = confirm('确定要运行吗？')
    if (!status) return
    startButton.style.display = 'none'
    stopButton.style.display = ''
    state = true
    scanPage()
  })

  // 停止循环
  stopButton.addEventListener('click', function () {
    stopButton.style.display = 'none'
    startButton.style.display = ''
    state = false
  })
}

// 页面加载完成后加载按钮
window.onload = () => init()

// 扫描页面
async function scanPage () {
  if (!state) return
  const token = await sendBackground({ action: 'getToken' })
  // 列表容器
  const listContainer = document.getElementsByClassName('virtual-tree-list-scroll-container')[0]
  // 聊天列表
  const list = listContainer.querySelectorAll('div[role="none"].ui-tree__item')
  for (const element of list) {
    const userId = element.id
    try {
      // 删除对话信息
      await fetch(`https://teams.live.com/api/groups/v1/threads/${userId}`, {
        headers: {
          authentication: `skypetoken=${token}`,
          'content-type': 'application/json'
        },
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'DELETE'
      }).then(response => response.json())
      console.log(`已删除 ${userId}`)
      await delay()
    } catch (error) {
      console.error(error)
    }
  }
  scanPage()
}
