const {connectAndExecQuery, getDataFromDb}=require('./dbconnect')
const {fetchUserDataCount,getEnergyAndRevenue}=require('./mongoDbInterface');
const {excelCreation}=require('./excel')
const {sendMail}=require('./sendGrid');
const mysql = require('mysql');
const envHostUrlMapping={
    TEST_CMS_3: 'testcms3.numocity.in',
    AARGO: 'aargocms.numocity.com',
    KURRENT: 'kurrentchargecms.numocity.com',
    DEV:'devfusion.numocity.in',
    FUSION_TEST:'cmsfusiontest.numocity.in'
}


const connectorTypeMapping={
    'CCS':1,
    'GBT':2,
    'Type_2': 3,
    'IEC_60309':4,
    'CHAdeMO': 5
}
const cmsUtilData=async()=>{
    const hosturl= envHostUrlMapping[environment];
    const numotype='ocpp';
    const query={}
    const usersCount=await fetchUserDataCount(numotype,query);
    const totalEnergyRevanue= await getEnergyAndRevenue(numotype);
    const deliveredEnergy=totalEnergyRevanue[0]? totalEnergyRevanue[0].deliveredEnergy : null;
    const totalPrice=totalEnergyRevanue[0]? totalEnergyRevanue[0].totalPrice : null;
    const utilMatrix={
        usersCount,
        deliveredEnergy,
        totalPrice,
    }
    const listData=await findListOfCpInfo()
    const countResponse= await countCmsUtilizationData();
    envInfo={
        host:environment,
        hosturl
    }
    const excel=await excelCreation(listData,countResponse,utilMatrix,envInfo)
    await sendMail(email,excel);
    process.exit(0);
}

const countCmsUtilizationData=async()=>{
    const response={}
    
    response.totalChargePoint=await findTotalChargePoint()
    response.licensePurchased= await licensePurchased();
    response.licenseUtilized= response.totalChargePoint;
    response.totalAc= await findTotalAcOrDc('AC')
    response.totalDc= await findTotalAcOrDc('DC')
    for (let type in connectorTypeMapping){
        connectorType=`total_${type}`
        response[connectorType]= await findConnectorTypeCount(connectorTypeMapping[type])
    }
    return response
}

const findTotalChargePoint=async()=>{
    let queryOps=countQueryWithoutCondition()+`chargepoint_table`;
    let queryData=[`ChargePointID`]
    const response= await getDataFromDb(queryOps, queryData, mysqlObj)
    if(!response || response.error){
        return 'no response from chargepoint_table'
    }
    return response[0]["count"];
}

const findTotalAcOrDc=async(type)=>{
    const tableName='assetdb.connector_model_table'
    let queryOps=countQueryWithCondition(tableName);
    queryOps=`select COUNT(ChargePointConnectorID) as count from chargepoint_connector_table cp left join connector_model_table cm on cm.ConnectorModelID = cp.ConnectorModelID where ConnectorModelCurrentType=?`
    const response= await getDataFromDb(queryOps, [type], mysqlObj)
    if(!response|| response.error){
        return 'no response from connector_model_table'
    }
    return response[0]["count"]
}

const findConnectorTypeCount=async(typeId)=>{
    const tableName='assetdb.connector_model_table';
    let queryOps=countQueryWithCondition(tableName);
    queryOps=`SELECT COUNT(ConnectorModelID) AS count FROM assetdb.connector_model_table WHERE ConnectorModelNumber=?`;
    const response= await getDataFromDb(queryOps, [typeId], mysqlObj)
    if(!response || response.error){
        return 'no response from connector_model_table'
    }
    return response[0]["count"]
}

const licensePurchased= async()=>{
    let queryOps=`SELECT SUM(LicenseLimit) AS count FROM assetdb.license`;
    const response= await getDataFromDb(queryOps, [], mysqlObj)
    if(!response || response.error){
        return 'no response from connector_model_table'
    }
    return response[0]["count"]
}

const findListOfCpInfo=async()=>{
    let queryOps=`select cp.ChargePointDisplayName, cm.ChargerModelName, cm.ChargerModelType, cm.ChargerModelVendor  from chargepoint_table cp left join charger_model_table cm on cm.ChargerModelID = cp.ChargerModelID`;
    const response= await getDataFromDb(queryOps, [], mysqlObj)
    if(!response || response.error){
        return 'no response from connector_model_table'
    }
    return response
}

const countQueryWithoutCondition=()=>{
    return `SELECT COUNT(?) AS count FROM `
}

const countQueryWithCondition=(tableName)=>{
    return `SELECT COUNT(*) AS count FROM ${tableName} WHERE ? = ? `
}
var arguments = process.argv
const environment=arguments[2];
const hosturl= envHostUrlMapping[environment];
const email=arguments[3];
const mysqlObj={
    host: hosturl,
    port: process.env.assetPort,
    password: process.env.password,
    user: process.env.user,
    database: 'assetdb',
};


cmsUtilData(environment, email);

