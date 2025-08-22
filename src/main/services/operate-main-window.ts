import {BrowserWindow, dialog, app} from "electron";
import ExcelJS from "exceljs";

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
    channel: 'operateExcel',
    handler: (event: Electron.IpcMainInvokeEvent, path: string) => {
      return new Promise(async resolve => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path);
        const worksheet = workbook.getWorksheet(1);
        const values = []
        worksheet.eachRow((row, rowNumber) => {
          values.push(row.values)
        });
        resolve(values)
      })
    },
  },
  {
    channel: 'changeSystemBar',
    handler: (event: Electron.IpcMainInvokeEvent, args: any) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      mainWindow.setTitleBarOverlay({
        color: args.background,
        symbolColor: args.color
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
