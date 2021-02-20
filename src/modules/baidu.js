const { shell } = require('electron')

let rePattern = /(baidu |bd |) *(.*)/i
export default function (inputString) {
    if (inputString.length === 0) {
        return []
    }
    let result = rePattern.exec(inputString)
    if (result.length < 3) {
        return []
    }
    else {
        return [
            {
                content: 'Baidu: ' + result[2],
                onClick: () => {
                    shell.openExternal('https://www.baidu.com/s?wd=' + result[2])
                }
            }]
    }
}