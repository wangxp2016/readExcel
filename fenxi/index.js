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

let seasonList = {}

function classifyOfData (outData, name, type, data) {
    outData[name][type].forEach((item, index) => {
        if (!outData[name][type][item]) {
            outData[name][type][item] = 0;
            outData[name][type]['Num' + item] = 0;
        }
        if (data[index + 1] != 0) {
            outData[name][type]['Num' + item]++
        }
        outData[name][type][item] += data[index + 1]
    })

    return outData[name][type];
}

function sum (arr) {
    return arr.reduce(function (prev, curr, idx, arr) {
        return prev + curr;
    });
}

function countFn (outData, type, name, data) {
    outData[name].count++;
    outData[name].total += sum(data.slice(1, 6));
    Object.assign(outData[name], classifyOfData(outData, name, type, data))
}
init()
function init () {
    fs.readdir(_file, function (err, files) {
        if (err) {
            throw err
        }
        var dataResult = {};
        files.forEach((item, index) => {
            try {
                console.log(`${_file}${item}`)
                let excelData = xlsx.parse(`${_file}${item}`)
                fileName = files[0].split(".")[0];
                excelData.forEach((item, index) => {
                    let jsonData = item.data;
                    let outData = {
                        "k__Eukaryota": { count: 0, total: 0 },
                        "p__Rotifera": { count: 0, total: 0 },
                        "c__Branchiopoda": { count: 0, total: 0 },
                        "c__Maxillopoda": { count: 0, total: 0 }
                    };
                    seasonList[item.name] = jsonData[0].slice(1, 6);
                    for (let data of jsonData) {
                        //console.log(item.name, data[data.length - 1]);
                        const colName = data[data.length - 1].split(";");
                        if (colName[0] && colName[0].trim() == "k__Eukaryota") {
                            countFn(outData, item.name, "k__Eukaryota", data)
                        } else if (colName[1] && colName[1].trim() == "p__Rotifera") {
                            countFn(outData, item.name, "p__Rotifera", data);
                        } else if (colName[2] && colName[2].trim() == "c__Branchiopoda") {
                            countFn(outData, item.name, "c__Branchiopoda", data);
                        } else if (colName[2] && colName[2].trim() == "c__Maxillopoda") {
                            countFn(outData, item.name, "c__Maxillopoda", data);
                        }
                    }
                    dataResult[item.name] = outData;
                })

            } catch (e) {
                console.log(e)
                console.log('excel表格内部字段不一致，请检查后再合并。')
            }
        })
        fs.writeFile(`${_output}resut_${fileName}.txt`, JSON.stringify(dataResult), function (err) {
            if (err) {
                throw err
            }
            console.log('\x1B[33m%s\x1b[0m', `完成合并：${_output}resut_${fileName}.txt`)
        })
        // 写xlsx
        // var buffer = xlsx.build(dataList)
        // fs.writeFile(`${_output}resut_${fileName}.xlsx`, buffer, function (err) {
        //     if (err) {
        //         throw err
        //     }
        //     console.log('\x1B[33m%s\x1b[0m', `完成合并：${_output}resut_${fileName}.xlsx`)
        // })
    })
}