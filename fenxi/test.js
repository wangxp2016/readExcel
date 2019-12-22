var arr = [
    { name: 'k__Metazoa; p__Rotifera; c__Monogononta;', age: 0 },
    { name: 'g__unidentified; s__Rotifera_sp._SHQC150603', age: 18 },
    { name: 'yjj', age: 8 }
];

function compare (property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}
console.log(arr.sort(compare('name')))