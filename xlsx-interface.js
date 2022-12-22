const xlsxp = require('xlsx-populate');
let appendChar;
const write = function(payload, paramtrs) {
  return new Promise(function(resolve, reject) {
    xlsxp.fromBlankAsync()
        .then((workbook) => {
          const sheet1 = workbook.sheet('Sheet1');
          writeHeaders(sheet1, paramtrs);
          for (let i = 0; i < payload.length; i++) {
            const item = Object.values(payload[i]);
            const char = 65;
            appendChar = '';
            const rowNum = 2 + i;
            for (let j=0; j<item.length; j++) {
              const charname = charGenerator(char, j);
              sheet1.cell(charname + rowNum).value(item[j]);
            }
          }
          checkForEmptyPayload(workbook, payload);
          return workbook.outputAsync();
        }).then((result)=>{
          resolve(result);
        }).catch((ex) => {
          reject(ex);
        });
  });
};

const checkForEmptyPayload=function(workbook, payload) {
  if (payload.length!=0) {
    return;
  }
  const range=workbook.sheet(0).range('A3:B3');
  range.value('No Data Found');
  range.merged(true);
};
const writeHeaders = function(sheet1, paramtrs) {
  if (paramtrs.length == 0) {
    throw new Error('Invalid Header');
  }
  appendChar = '';
  for (let i = 0; i < paramtrs.length; i++) {
    const charname = charGenerator(65, i);
    sheet1.column(charname).width(paramtrs[i].width);
    sheet1.cell(charname + (1)).value(paramtrs[i].name);
  }
};
function charGenerator(char, i) {
  if (i%26 == 0 && i != 0) {
    appendChar =String.fromCharCode(char+((i/26-1)));
    return (appendChar+String.fromCharCode(char+(i%26)));
  } else {
    return (appendChar+String.fromCharCode(char+(i%26)));
  }
}

const read=function(path) {
  return new Promise(function(resolve) {
    xlsxp.fromFileAsync(path)
        .then((workbook) => {
          return workbook.outputAsync();
        }).then((data)=>{
          resolve(data);
        });
  });
};
module.exports = {
  write, read,
};
