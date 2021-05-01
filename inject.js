const { ipcRenderer } = require("electron");
const { LiveChat } = require('youtube-chat')
const queue = [];
let ytConnected = false;

window.addEventListener('load', () => {
  console.log("load")
  document.querySelector("#startBtn").addEventListener('click', () => {
    console.log("btn")
    const zid = document.getElementById("zid").value.replace(/\s/g, "");
    const pwd = document.getElementById("pwd").value.replace(/\s/g, "");
    ipcRenderer.sendToHost("start", zid, pwd);
  })
})

ipcRenderer.on("getComment", function () {
  ipcRenderer.sendToHost("comment", queue.shift());
})

ipcRenderer.on("initialize", function (event, data) {
  initialize(`${data.id}`, `${data.pwd}`, 'Aircon')
})


ipcRenderer.on("ytComment", function (event, comment) {
  queue.push(comment);
})

ipcRenderer.on("connectYouTubeLive", function (event) {
  ytConnected = true;
})

ipcRenderer.on("connectCommentScreen", function () {
  const chatBtn = document.querySelector('button[aria-label="open the chat pane"]');
  if(chatBtn) chatBtn.click();
  const chatContainer = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer");
  if(!chatContainer) return alert("チャットを送信してください")

  let name = "";
  // let line = 1;

  const chatObserver =new MutationObserver((records) => {
    records.forEach(r=> {
      const addedNodes = [...r.addedNodes]
      addedNodes.forEach(node => {
        let msg = null
        if([...node.classList].includes("chat-item__chat-info")){ // ユーザ切り替え
          name = node.querySelector(".chat-item__sender").innerText
          msg = node.querySelector(".chat-message-text-content").innerText
        }
        if([...node.classList].includes("chat-item__chat-info-msg")){ // 同ユーザ
          msg = node.querySelector(".chat-message-text-content").innerText
        }
        if(msg == null) return

        queue.push(msg + " by " + name + (ytConnected ? "@Zoom" : ""))
      }) 
    })
  });

  chatObserver.observe(chatContainer, { childList: true, subtree: true });

  ipcRenderer.sendToHost("connected")
});
