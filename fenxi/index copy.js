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

let colList = [
    "Actinopteri",
    "Amphibia",
    "Anopla",
    "Anthozoa",
    "Arachnida",
    "Aves",
    "Bdelloidea",
    "Bivalvia",
    "Branchiopoda",
    "Catenulida",
    "Cephalopoda",
    "Cestoda",
    "Chilopoda",
    "Chromadorea",
    "Clitellata",
    "Collembola",
    "Crinoidea",
    "Demospongiae",
    "Diplopoda",
    "Echinoidea",
    "Enopla",
    "Enoplea",
    "Eutardigrada",
    "Gastropoda",
    "Gymnolaemata",
    "Homoscleromorpha",
    "Hydrozoa",
    "Insecta",
    "Malacostraca",
    "Mammalia",
    "Maxillopoda",
    "Monogononta",
    "Ostracoda",
    "Palaeonemertea",
    "Phylactolaemata",
    "Polychaeta",
    "Rhabditophora",
    "Scyphozoa",
    "Staurozoa",
].map(function (item) {
    return "c__" + item
})

let seasonList = {}

//const OtuName = colList[0];

function zoop (outData, colName, name, data) {//浮游动物
    if (colName[0] && colName[0].trim() == "k__Eukaryota") {
        countFn(outData, name, "k__Eukaryota", data)
    } else if (colName[2] && colName[2].trim() == "c__Branchiopoda") {
        countFn(outData, name, "c__Branchiopoda", data);
    } else if (colName[2] && colName[2].trim() == "c__Maxillopoda") {
        countFn(outData, name, "c__Maxillopoda", data);
    } else if (colName[1] && colName[1].trim() == "p__Rotifera") {
        countFn(outData, name, "p__Rotifera", data);
    }
}

function water (outData, colName, name, data, OtuName) {//浮游动物
    if (colName[2] && colName[2].trim() == OtuName) {
        countFn(outData, name, OtuName, data)
    }
}


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
    // Object.assign(outData[name], classifyOfData(outData, name, type, data))
}

function doData (dataResult, excelData, OtuName) {
    excelData.forEach((item, index) => {
        let jsonData = item.data;
        let outData = {};
        outData[OtuName] = { count: 0, total: 0 }
        // for (const i in outData) {
        //     outData[i][item.name] = jsonData[0].slice(1, 6);
        // }
        //seasonList[item.name] = jsonData[0].slice(1, 6);
        for (let data of jsonData) {
            const colName = data[data.length - 1].split(";");
            //zoop(outData, colName, item.name, data);//浮游动物
            water(outData, colName, item.name, data, OtuName);//水生动物
        }
        console.log(outData);
        if (!dataResult[item.name]) {
            dataResult[item.name] = {};
        }
        if (!dataResult[item.name][OtuName]) {
            dataResult[item.name][OtuName] = {};
        }
        dataResult[item.name][OtuName] = outData;
    })
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
                colList.forEach((item) => {
                    doData(dataResult, excelData, item);
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
    })
}