const {ipcMain, dialog, shell, BrowserWindow} = require('electron')
const path = require("path");
const {download} = require('electron-dl')

export const initDown = (win) => {
  let downObj = {
    downPath: '',
    fileName: '',
    savePath: ''
  }

  ipcMain.on('download', (event, args) => {
    downObj.downPath = args.downPath
    downObj.fileName = args.fileName
    let ext = path.extname(downObj.fileName)
    let filters = [{name: '全部文件', extensions: ['*']}]
    if (ext && ext !== '.') {
      filters.unshift({
        name: '',
        extensions: [ext.match(/[a-zA-Z]+$/)[0]]
      })
    }

    dialog.showOpenDialog(win, {
      filters,
      properties: ['openDirectory']
    }).then((result) => {
      console.log(result)
      download(BrowserWindow.getFocusedWindow(), args.downloadPath, {
        directory: result.filePath,
        onProgress: status => win.webContents.send("download progress", status)
      }).then(
        dl => win.webContents.send('download complete', dl.getSavePath())
      )
    }).catch(() => {
    })

  })
}

