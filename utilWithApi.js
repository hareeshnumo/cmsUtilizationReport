const {fetchUserDataCount}=require('./mongoDbInterface');
const {getReqHandler}=require('./getRequestHandler');
const {excelCreation}=require('./excel')
const {sendMail}=require('./sendGrid');
var arguments = process.argv
const environment=arguments[2];
const email=arguments[3];
const numotype=arguments[4];
// const token=arguments[5];

const envHostUrlMapping={
    TEST_CMS_3: 'testcms3.numocity.in',
    AARGO: 'aargocms.numocity.com',
    KURRENT: 'kurrentchargecms.numocity.com',
    DEV:'devfusion.numocity.in',
    FUSION_TEST:'cmsfusiontest.numocity.in'
}
const hosturl= envHostUrlMapping[environment];
envInfo={
    host:environment,
    hosturl
}
const mysqlObj={
    host: hosturl,
    port: process.env.assetPort,
    password: process.env.password,
    user: process.env.user,
    database: 'assetdb',
};

const utilizationReport=async()=>{
    const hosturl= envHostUrlMapping[environment];
    const query={}
    const usersCount=await fetchUserDataCount(numotype,query);
    const energyAndRevanue=await fetchEnergyAndRevenue()
    const utilMatrix={
        usersCount,
        ...energyAndRevanue
    }
    const listInfo= await fetchCpDetails()
    const listData=listInfo.list;

    const countInfoData=await fetchcountDetails()
    const countResponse=renameCountInfoData(countInfoData)
    countResponse['totalChargePoint']=listInfo.totalChargePoint;
    const excel=await excelCreation(listData,countResponse,utilMatrix,envInfo)
    await sendMail(email,excel);
    process.exit(0);

}
const fetchEnergyAndRevenue=async()=>{
    const url=`${process.env.numoReportApi}/businessMetrixData?numotype=${numotype}`
    const response= await getReqHandler(url,'')
    const responseData={
        deliveredEnergy:'',
        totalPrice:''
    }
    responseData.deliveredEnergy=response?.TotalUnits;
    responseData.totalPrice=response?.TotalAmount;
    return responseData;
}

const fetchCpDetails= async()=>{
    const cpDetail=[]
    const url=`${process.env.numoAccess}/location-status?numotype=${numotype}`
    const response= await getReqHandler(url,'')
    if(!response || !response.StationListDocument){
        return cpDetail
    }
    StationList=response.StationListDocument
    let totalChargePoint=0;
    for(let stationData of StationList){
        for(cp of stationData.ChargePoints){
            totalChargePoint=totalChargePoint+1;
            const cpInfo={
                ChargePointDisplayName:cp.name,
                ChargerModelType:null,
                ChargerModelVendor:cp.OEM,
                ChargerModelName:cp.Model
            }
            cpDetail.push(cpInfo)
        }
    }
    // const responseData= StationList.map((list)=>{
    //     for(let cp of list.ChargePoints){
    //         totalChargePoint=totalChargePoint+1;
    //         const cpInfo={
    //             ChargePointDisplayName:cp.name,
    //             ChargerModelType:null,
    //             ChargerModelVendor:cp.OEM,
    //             ChargerModelName:cp.Model
    //         }
    //         return cpInfo;
    //     }
    // })
    const responseDataObj={
        list:cpDetail,
        totalChargePoint
    }
    return responseDataObj;
}

const fetchcountDetails=async()=>{
    const count={
        'CCS':0,
        'GBT':0,
        'Type 2':0,
        'IEC_60309':0,
        'CHAdeMO':0,
        '16A':0,
    }
    const url=`${process.env.numoAccess}/charger-status?numotype=${numotype}&web=Yes`;
    const response= await getReqHandler(url,'')
    if(!response||response.response.length==0){
        return count;
    }
    for(let val of response.response){
        count[val.connectorType]=count[val.connectorType]+1;
    }
    return count
}

const renameCountInfoData=(countInfoData)=>{
    const countData={
        total_CCS:countInfoData.CCS,
        total_GBT:countInfoData.GBT,
        total_Type_2:countInfoData['Type 2'],
        total_IEC_60309:countInfoData.IEC_60309,
        total_CHAdeMO:countInfoData.CHAdeMO,
    }
    return countData
}

utilizationReport()