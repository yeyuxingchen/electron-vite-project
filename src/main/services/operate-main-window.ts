import {BrowserWindow, dialog, app} from "electron";

export const operateMainWindow = [
  {
    channel: 'fullScreenAndOnTop',
    handler: (event: Electron.IpcMainInvokeEvent) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      // 全屏且置顶
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
      mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop())
    },
  },
  {
    channel: 'openDialog',
    handler: (event: Electron.IpcMainInvokeEvent, args: any) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      return new Promise(resolve => {
        dialog.showOpenDialog(mainWindow, args).then((result) => {
          resolve(result)
        })
      })
    },
  },
  {
    channel: 'openDevTools',
    handler: (event: Electron.IpcMainInvokeEvent) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      mainWindow.webContents.openDevTools({
        mode: 'undocked',
        activate: true,
      })
    },
  },
  {
    channel: 'forExample',
    handler: (event: Electron.IpcMainInvokeEvent) => {
      return new Promise(resolve => {
        const path = app.getAppPath()
        resolve(path as string)
      })
    },
  }
]
