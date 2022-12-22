const XlsxPopulate = require('xlsx-populate');
const excelCreation=async (listData,countResponse,utilMatrix)=>{
    const workbook = await XlsxPopulate.fromFileAsync('./customerUtilization.xlsx');
    const invoiceExcel=workbook.sheet(0);
    invoiceExcel.cell('A3').value(utilMatrix.usersCount);
    invoiceExcel.cell('B3').value(utilMatrix.deliveredEnergy);
    invoiceExcel.cell('C3').value(utilMatrix.totalPrice);
    invoiceExcel.cell('A6').value(countResponse.totalChargePoint);
    invoiceExcel.cell('B6').value(countResponse.totalAc);
    invoiceExcel.cell('C6').value(countResponse.totalDc);
    invoiceExcel.cell('D6').value(countResponse.licensePurchased);
    invoiceExcel.cell('E6').value(countResponse.licenseUtilized);
    invoiceExcel.cell('A8').value(countResponse.total_CCS);
    invoiceExcel.cell('B8').value(countResponse.total_GBT);
    invoiceExcel.cell('C8').value(countResponse.total_Type_2);
    invoiceExcel.cell('D8').value(countResponse.total_IEC_60309);
    invoiceExcel.cell('E8').value(countResponse.total_CHAdeMO);
    const listLength=listData.length;
  
    for (let i=0; i<listLength; i++) {
      const row=12;
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