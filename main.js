const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {

mainWindow = new BrowserWindow({

width: 1400,
height: 900,

icon: path.join(__dirname, "logo.png"),

webPreferences: {

nodeIntegration: true,
contextIsolation: false,
preload: path.join(__dirname, "preload.js")

}

});

mainWindow.loadFile("index.html");

mainWindow.setMenuBarVisibility(false);

}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {

if (process.platform !== "darwin") {
app.quit();
}

});

app.on("activate", () => {

if (BrowserWindow.getAllWindows().length === 0) {
createWindow();
}

});