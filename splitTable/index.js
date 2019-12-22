const xlsx = require('node-xlsx')
const crypto = require('crypto');
const fs = require('fs')
// excel文件夹路径（把要合并的文件放在excel文件夹内）
const _file = `${__dirname}/excel/`
const _output = `${__dirname}/result/`
// 合并数据的结果集
let dataList = [{
    name: 'AUT',
    data: []
}, {
    name: 'SPR',
    data: []
}, {
    name: 'SUM',
    data: []
}, {
    name: 'WIN',
    data: []
}]

let season = {
    AUT: 0,
    SPR: 1,
    SUM: 2,
    WIN: 3
}

function encryptMd5 (str) {
    const md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex').toLowerCase();
}

function sum (arr) {
    if (arr.length > 0) {

        return arr.reduce(function (prev, curr, idx, arr) {
            return prev + curr;
        });
    } else {
        return 0;
    }
}

function getArrData (data, start, end, type) {
    var array = [data[0], data[data.length - 1]];
    if (sum(data.slice(start, end)) != 0) {
        array.splice(1, 0, ...data.slice(start, end));
        dataList[season[type]].data.push(array);
    }
}

init()
function init () {
    fs.readdir(_file, function (err, files) {
        if (err) {
            throw err
        }
        // files是一个数组
        // 每个元素是此目录下的文件或文件夹的名称
        // console.log(`${files}`);
        fileName = files[0].split(".")[0];
        files.forEach((item, index) => {
            try {
                console.log(`${_file}${item}`)
                console.log(`开始合并：${item}`)
                let excelData = xlsx.parse(`${_file}${item}`)
                let jsonData = excelData[0].data;
                let outData = {
                    "AUT": [],
                    "SPR": [],
                    "SUM": [],
                    "WIN": []
                };
                for (data of jsonData) {
                    if (data[data.length - 2] != 0) {
                        getArrData(data, 1, 10, "SUM");
                        getArrData(data, 10, 19, "AUT");
                        getArrData(data, 19, 28, "WIN");
                        getArrData(data, 28, 37, "SPR");
                    }

                }
            } catch (e) {
                console.log(e)
                console.log('excel表格内部字段不一致，请检查后再合并。')
            }
        })
        // 写xlsx
        var buffer = xlsx.build(dataList)
        fs.writeFile(`${_output}resut_${fileName}.xlsx`, buffer, function (err) {
            if (err) {
                throw err
            }
            console.log('\x1B[33m%s\x1b[0m', `完成合并：${_output}resut_${fileName}.xlsx`)
        })
    })
}