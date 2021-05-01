const { app, BrowserWindow, ipcMain } = require('electron');
const electron = require('electron');
const log = require('electron-log');

app.commandLine.appendSwitch('disable-renderer-backgrounding');

process.on('uncaughtException', function(err) {
  log.error('electron:event:uncaughtException');
  log.error(err);
  log.error(err.stack);
  app.quit();
});

const screens = [];

const main = async () => {

  var electronScreen = electron.screen;

  const globalShortcut = electron.globalShortcut;
  globalShortcut.register('Cmd+Alt+,', function() {　　　　
    screens.forEach(s => {
      s.webContents.send('hide');
    })
  })

  var displays = electronScreen.getAllDisplays();

  displays.forEach(display => {
  
    const commentWindow = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.size.width,
      height: display.size.height,
      webPreferences: {
        nodeIntegration: true
      },
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      hasShadow: false,
    })
    commentWindow.setAlwaysOnTop(true, 'screen-saver')

    commentWindow.loadFile('comment.html')
    commentWindow.setIgnoreMouseEvents(true)
    // commentWindow.maximize()
    // commentWindow.show()

    screens.push(commentWindow)
  })

  

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    }
  })
  
  await win.loadFile('index.html')
  win.on('close', app.quit)

  ipcMain.on("comment", async function (event, comment) {
    if(comment) {
      screens.forEach(screen => {
        screen.webContents.send('onComment', comment);
      })
    }

    setTimeout(() => {
      event.sender.send('getComment')
    }, 10)
  })

  ipcMain.on("yt", async function (event, comment) {
    if(comment) {
      ipcMain.emit('ytComment', comment)
    }
  })

}

app.on('ready', main)

app.on('close', () => {
  Electron.session.defaultSession.clearCache(() => {app.quit()})
})

