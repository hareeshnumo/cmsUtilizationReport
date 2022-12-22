const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AllSchema = new Schema({}, {strict: false});

let connected = false;

function collection(collectionName) {
  let modelSchemas;
  try {
    modelSchemas = mongoose.model(collectionName);
  } catch (error) {
    modelSchemas = mongoose.model(collectionName, AllSchema, collectionName);
  }
  return modelSchemas;
}


function connect(uri=process.env.MongoURI) {
  return new Promise(function(resolve, reject) {
    mongoose.connect(uri,
        {useNewUrlParser: true, useUnifiedTopology: true},
        function(err) {
          if (!err) {
            console.log(`connected to ${uri}`);
            connected = true;
            resolve();
          } else {
            reject(Error(`no database connection: ${err.message}`));
          }
        });
  });
}

function indexOn(collectionName, query) {
  if (!connected) {
    return Promise.reject(Error(`attempting Indexing with no connection`));
  }

  return mongoose.connection.collections[collectionName].createIndex(query);
}

function isGoodToStore({collectionName, operationMsg}) {
  if (!collectionName) {
    return Promise.reject(Error(
        `no collectionName given for ${operationMsg}`));
  }
  if (!connected) {
    return Promise.reject(Error(`${operationMsg} with no connection`));
  }
  return Promise.resolve();
}

function isEmptyQuery(queryObject) {
  console.log('queryObject', queryObject);
  if (Object.entries(queryObject).length === 0 &&
  queryObject.constructor === Object) {
    return Promise.reject(Error(
        `required atleast one parameter`));
  }
  return Promise.resolve();
}

module.exports = {collection, connect, isGoodToStore, indexOn, isEmptyQuery};
