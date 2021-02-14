/**
 * Get Client Options
 * @param  {Function} start function
 * @param  {Boolean} headless
 */

module.exports = options = (headless, start) => {
    const options = {
        licenseKey: 'your license key',
        sessionId: 'leviBot',
        useChrome: true,
        headless: headless,
        stickerServerEndpoint: true,
        qrRefreshS: 17,
        qrTimeout: 0,
        authTimeout: 0,
        autoRefresh: true,
        cacheEnabled: false,
        blockCrashLogs: true,
        restartOnCrash: start,
        throwErrorOnTosBlock: false,
        killProcessOnBrowserClose: true,
        deleteSessionDataOnLogout: false,
        skipBrokenMethodsCheck: true,
        skipUpdateCheck: true,
        disableSpins: false,
        useStealth: true,
        logConsole: true,
        logConsoleErrors: true,
        trace: true

    }

    return options
    // const chromePath = {
    //     win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows 32 bit
    //     win64: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', // Windows 64 bit
    //     linuxChrome: '/usr/bin/google-chrome-stable', // Linux - Chrome
    //     linuxChromium: '/usr/bin/chromium-browser', // Linux - Chromium
    //     darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // MacOS
    // }

    // if (fs.existsSync(chromePath.win32)) {
    //     execPath = chromePath.win32
    // } else if (fs.existsSync(chromePath.win64)) {
    //     execPath = chromePath.win64
    // } else if (fs.existsSync(chromePath.linuxChrome)) {
    //     execPath = chromePath.linuxChrome
    // } else if (fs.existsSync(chromePath.linuxChromium)) {
    //     execPath = chromePath.linuxChromium
    // } else if (process.platform === 'darwin') {
    //     execPath = chromePath.darwin
    // } else {
    //     console.error(new Error('Google Chrome Is Not Installed'))
    //     process.exit(1)
    // }




}