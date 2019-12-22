const xlsx = require('node-xlsx')
const crypto = require('crypto');
const fs = require('fs')
// excel文件夹路径（把要合并的文件放在excel文件夹内）
const _file = `${__dirname}/excel/`
const _output = `${__dirname}/result/`
// 合并数据的结果集
let dataList = [{
    name: 'sheet1',
    data: []
}]

function encryptMd5 (str) {
    const md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex').toLowerCase();
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
                let outData = {};
                for (data of jsonData) {
                    const colName = encryptMd5(data[data.length - 1]);
                    if (outData[colName]) {
                        for (let i = 1; i < data.length - 1; i++) {
                            outData[colName][i] += data[i];
                        }
                    } else {
                        outData[colName] = data;
                    }
                }
                dataList[0].data = Object.values(outData);
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