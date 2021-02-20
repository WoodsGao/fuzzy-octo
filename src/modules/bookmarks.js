const { shell } = require('electron')
const fs = require('fs')
let bookmarkPath = '/Users/admin/Library/Application\ Support/Google/Chrome/Profile\ 1/Bookmarks'
let bookmarksMap = new Map()

function findBookmark(node) {
    if (node.type == 'folder') {
        for (const child of node.children) {
            findBookmark(child)
        }
    }
    else if (node.type == 'url') {
        bookmarksMap.set(node.name, node.url)
    }
}

function reloadBookmark() {
    fs.readFile(bookmarkPath, 'utf8', (err, data) => {
        // You should always specify the content type header,
        // when you don't use 'res.json' for sending JSON.
        if (err) {
            console.log(err)
        }
        else {
            let root = JSON.parse(data).roots
            bookmarksMap = new Map()
            for (const key in root) {
                findBookmark(root[key])
            }
        }
    })
}

reloadBookmark()

export default function (inputString) {
    if (inputString.length === 0) {
        return []
    }
    let results = []
    let words = inputString.toLowerCase().split(' ')
    console.log(bookmarksMap)
    for (let [name, url] of bookmarksMap) {
        console.log(name)
        let lowerName = name.toLowerCase()
        let lowerUrl = url.toLowerCase()
        let matched = true
        for (const word of words) {
            if (lowerName.indexOf(word) < 0) {
                matched = false
                break
            }
        }
        if (!matched) {
            matched = true
            for (const word of words) {
                if (lowerUrl.indexOf(word) < 0) {
                    matched = false
                    break
                }
            }
        }
        if (matched) {
            results.push({
                content: name,
                onClick: () => {
                    shell.openExternal(url)
                }
            })
        }
    }
    return results
}