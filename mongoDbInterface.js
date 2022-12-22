  
  const {collection, connect, isGoodToStore, isEmptyQuery} = require('./storage');

  const fetchUserDataCount= async (numotype, query)=>{
    await connect();
    const userDbObj={
      collectionName: `${numotype}_users`,
      query,
    };
    return await recallAllCount(userDbObj);
  };

  function recallOne({collectionName, identifier}) {
    return recallAll({collectionName, query: {identifier}})
        .then(singleOrUndefined);
  }
  
  function deleteOne({collectionName, identifier}) {
    return deleteAll({collectionName, query: {identifier}});
  }
  
  function deleteAll({collectionName, query}) {
    return isGoodToStore({
      collectionName, operateMsg: `query ${JSON.stringify(query)}`,
    }).then(()=>{
      const store= collection(collectionName);
      return store.deleteMany(query).exec();
    });
  }
  
  function recallAll({collectionName, query}) {
    return isGoodToStore({
      collectionName, operationMsg: `query ${JSON.stringify(query)}`,
    }).then(()=> {
      const storage = collection(collectionName);
      return storage.find(query).exec().then(mongo2objects);
    });
  }
  
  function recallAllCount({collectionName, query}) {
    return isGoodToStore({
      collectionName, operationMsg: `query ${JSON.stringify(query)}`,
    }).then(()=> {
      const storage = collection(collectionName);
      return storage.count(query).exec();
    });
  }

  function recallAllSorted({collectionName, query, sortCondition}) {
    return isGoodToStore({
      collectionName, operationMsg: `query ${JSON.stringify(query)}`}).then(()=> {
      const dbStorage = collection(collectionName);
      return dbStorage.find(query).sort(sortCondition).exec().then(mongo2objects);
    });
  }
  
  function recallWithAlias({query, collectionName}) {
    return isGoodToStore({
      collectionName, operationMsg: `query parameter ${JSON.stringify(query)}`,
    }).then(()=> {
      return isEmptyQuery(query).then(() => {
        const storage = collection(collectionName);
        return storage.aggregate([{$project: query}]).exec();
      });
    });
  }
  
  function mongo2objects(mongoResults) {
    return Promise.resolve(mongoResults.map((o)=> o.toObject()));
  }
  
  function singleOrUndefined(resultSet) {
    if (resultSet.length == 0) {
      return Promise.resolve(undefined);
    } else if (resultSet.length == 1) {
      return Promise.resolve(resultSet[0]);
    } else {
      return Promise.reject(
          Error(`single or none expected, but ${resultSet.length} found.
          the first one is: ${JSON.stringify(resultSet[0])}`));
    }
  }
  
  function recallWithAggregate({aggregateQuery, collectionName}) {
    return isGoodToStore({
      collectionName,
      operationMsg: `query parameter ${JSON.stringify(aggregateQuery)}`,
    }).then(()=> {
      return isEmptyQuery(aggregateQuery).then(() => {
        const storage = collection(collectionName);
        return storage.aggregate(aggregateQuery).exec();
      });
    });
  }

  const getEnergyAndRevenue= async (numotype)=>{
    await connect();
    const matchEnergyAndRevenueQuery = {
      'entryType': {$eq: 'debit'},
      'totalAmount': {$gte: 0},
    };
    const group={
      '_id':`util_${new Date()}`
    };
    group['totalPrice']={'$sum': '$totalAmount'};
    group['deliveredEnergy']={'$sum': '$deliveredWh'};
    const energyAndRevenueObj={
      aggregateQuery: [
        {$match: matchEnergyAndRevenueQuery},
        {$group: group},
  
      ],
      collectionName: `${numotype}_invoices`,
    };
    const invoiceEnergyAndRevenue=await recallWithAggregate(energyAndRevenueObj);
    return invoiceEnergyAndRevenue;
  };
  
  module.exports = {connect, recallOne, recallAll, recallWithAlias,
    singleOrUndefined, deleteAll, deleteOne, recallWithAggregate,
    recallAllSorted, fetchUserDataCount,getEnergyAndRevenue};
  
