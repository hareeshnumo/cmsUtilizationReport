const XlsxPopulate = require('xlsx-populate');
const excelCreation=async (listData,countResponse,utilMatrix, envInfo)=>{
    const workbook = await XlsxPopulate.fromFileAsync('./customerUtilization.xlsx');
    const invoiceExcel=workbook.sheet(0);
    invoiceExcel.cell('B2').value(envInfo.host);
    invoiceExcel.cell('C2').value(envInfo.hosturl);
    invoiceExcel.cell('A6').value(utilMatrix.usersCount);
    invoiceExcel.cell('B6').value(utilMatrix.deliveredEnergy);
    invoiceExcel.cell('C6').value(utilMatrix.totalPrice);
    invoiceExcel.cell('A10').value(countResponse.totalChargePoint);
    invoiceExcel.cell('B10').value(countResponse.totalAc);
    invoiceExcel.cell('C10').value(countResponse.totalDc);
    invoiceExcel.cell('D10').value(countResponse.licensePurchased);
    invoiceExcel.cell('E10').value(countResponse.licenseUtilized);
    invoiceExcel.cell('A12').value(countResponse.total_CCS);
    invoiceExcel.cell('B12').value(countResponse.total_GBT);
    invoiceExcel.cell('C12').value(countResponse.total_Type_2);
    invoiceExcel.cell('D12').value(countResponse.total_IEC_60309);
    invoiceExcel.cell('E12').value(countResponse.total_CHAdeMO);
    const listLength=listData.length;
  
    for (let i=0; i<listLength; i++) {
      const row=16;
      invoiceExcel.cell(`A${i+row}`).value(listData[i].ChargePointDisplayName);
      invoiceExcel.cell(`B${i+row}`).value(listData[i].ChargerModelType);
      invoiceExcel.cell(`C${i+row}`).value(listData[i].ChargerModelVendor);
      invoiceExcel.cell(`D${i+row}`).value(listData[i].ChargerModelName);
      invoiceExcel.cell(`E${i+row}`).value(listData[i].invoiceId);
    }
    const outputExcel=await workbook.toFileAsync('./customerUtilization.xlsx');
    // const outputExcel=await workbook.outputAsync();
    return outputExcel;
  };

  module.exports={
    excelCreation
  }