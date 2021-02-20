const { shell } = require('electron')
const translate = require('google-translate-free')

let rePattern = /(translate|tr) (c2e|e2c|) *(.*)/i
export default function (inputString) {
    if (inputString.length === 0) {
        return []
    }
    let matchResult = rePattern.exec(inputString)
    let results = []
    if (matchResult.length < 4 && matchResult[3].length > 0) {
        return []
    }
    else if (matchResult[2] == 'c2e' || matchResult[2] == '') {
        translate(matchResult[3], { from: 'zh-cn', to: 'en' }).then(text => {
            results.push(
                {
                    content: 'Translate 中->英: ' + text,
                    onClick: () => { }
                }
            )
        }).catch(err => {
            console.log(err)
        })
    }
    else if (matchResult[2] == 'e2c' || matchResult[2] == '') {
        translate(matchResult[3], { from: 'en', to: 'zh-cn' }).then(text => {
            results.push(
                {
                    content: 'Translate 英->中: ' + text,
                    onClick: () => { }
                }
            )
        }).catch(err => {
            console.log(err)
        })
    }
}