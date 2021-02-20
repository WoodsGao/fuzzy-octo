const { shell } = require('electron')

let rePattern = /(google |gg |) *(.*)/i
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
                content: 'Google: ' + result[2],
                onClick: () => { shell.openExternal('https://www.google.com/search?q=' + result[2]) }
            }]
    }
}