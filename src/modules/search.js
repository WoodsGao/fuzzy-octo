const { shell } = require('electron')
const fs = require('fs')
const pinyin = require("pinyin")

let pathList = [
    '/Applications',
    '/Users/admin/Documents/projects',
    '/Users/admin/Documents/archive',
]

function matchSequence(realString, inputString) {
    let lowerRealString = realString.toLowerCase()
    let lowerInputString = inputString.toLowerCase()
    let pinyinRealString = pinyin(lowerRealString, {
        style: pinyin.STYLE_NORMAL
    })
    // 添加汉字和首字母
    let index = 0
    for (let choices of pinyinRealString) {
        if (choices[0] == lowerRealString.substring(index, index + choices[0].length)) {
            index += choices[0].length
        }
        else {
            choices.push(choices[0].substring(0, 1))
            choices.push(lowerRealString.substring(index, index + 1))
            index++
        }
    }

    // 贪婪+回溯搜索
    // 0: 没匹配完, 1: input匹配完real没匹配完, 2: 都匹配完
    function match(realIndex, inputIndex) {
        if (lowerInputString.length == inputIndex) {
            if (pinyinRealString.length == realIndex) {
                return 2
            }
            else {
                return 1
            }
        }
        else if (pinyinRealString.length == realIndex) {
            return 0
        }
        let result = 0
        // console.log(pinyinRealString[realIndex], inputIndex)
        for (const choice of pinyinRealString[realIndex]) {
            if (choice == lowerInputString.substring(inputIndex, inputIndex + choice.length)) {
                result = Math.max(result, match(realIndex + 1, inputIndex + choice.length))
            }
            // input的最后一段判断是不是real.startswith(input)
            else if (lowerInputString.length - inputIndex < choice.length) {
                if (choice.startsWith(lowerInputString.substring(inputIndex))) {
                    result = Math.max(result, 1)
                }
            }
        }
        return result
    }
    return match(0, 0)
}

function findChildren(parent, nameList) {
    if (!fs.existsSync(parent)) {
        return []
    }
    if (!fs.lstatSync(parent).isDirectory() || nameList.length == 0) {
        return [parent]
    }
    let results = []
    let level = 2
    // 最后一个, 不需要完全匹配
    if (nameList.length == 1) {
        level = 1
    }
    for (const childName of fs.readdirSync(parent)) {
        if (matchSequence(childName, nameList[0]) >= level) {
            results = results.concat(findChildren(parent + '/' + childName, nameList.slice(1)))
        }
    }
    return results
}
export default function (inputString) {
    if (inputString.length === 0) {
        return []
    }
    let results = []
    let tempPathList = pathList
    let nameList = inputString.split('/')
    if (nameList[0] == '~' || nameList[0] == '') {
        tempPathList = [inputString[0]]
        nameList.pop(0)
    }
    for (const path of tempPathList) {
        for (const r of findChildren(path, nameList)) {
            results.push({ content: r, onClick: () => { shell.openPath(r) } })
        }
    }
    return results
}