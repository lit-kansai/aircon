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
  let line = 1;
  const contentObserver = new MutationObserver((records) => {
    const msg = records[0].target.data.split("\n");
    const newLine = msg.length;
  
    queue.push(msg.slice(line).join("\n") + " by " + name + (ytConnected ? "@Zoom" : ""))
    
    line = newLine;
  });
  const chatboxObserver = new MutationObserver((records) => {
    if (contentObserver) contentObserver.disconnect();
    const addedChild = records[0].addedNodes[0];
    const msg = addedChild.querySelector(".chat-item__chat-info-msg");
    name = addedChild.querySelector(".chat-item__chat-info-header--can-select")
      .innerText;
    queue.push(msg.innerText + " by " + name + (ytConnected ? "@Zoom" : ""))
    line = msg.innerText.split("\n").length;
    contentObserver.observe(msg.childNodes[0], { characterData: true });
  });
  chatboxObserver.observe(chatContainer, { childList: true });

  ipcRenderer.sendToHost("connected")
});
