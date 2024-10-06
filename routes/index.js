var express = require("express");
var router = express.Router();
const soap = require("soap");

/**
 *
 * @param {soap.Client} client
 * @returns {string[]}
 */
function extractOperationNames(client) {
  const services = client.describe();
  const names = Object.values(services).flatMap((ports) =>
    Object.values(ports).flatMap((methods) => Object.keys(methods))
  );
  return names;
}

/**
 * 
 * @param {soap.Client} client 
 */
function extractModels(client) {
  const services = client.describe();
  const modelMetadataInfo = [];
  for (let srv in services) {
    for (let port in services[srv]) {
      const curPort = services[srv][port];
      Object.keys(curPort)        
        .forEach(key => {
          console.log(`KEY ${key}`)
          console.log(`current key`, curPort[key]);
          const input = curPort[key]['input'];
          const output = curPort[key]['output'];
          console.log('input', input)
          console.log('output', output)
          const inputMetadata = analyOperationModel(input);
          const outputMetadata = analyOperationModel(output);
          console.log(inputMetadata, outputMetadata)
          const serviceMetadataInfo = {
            'operationName': key, 
            'inputMetadata': inputMetadata,
            'outputMetadata': outputMetadata
          }
          modelMetadataInfo.push(serviceMetadataInfo);
        });
    }
  }
  return modelMetadataInfo;
}

/**
 * 
 * @param {[key:string]: any} obj 
 */
function analyOperationModel(obj) {
  const metadata = [];
  if (!obj) return metadata;
  Object.keys(obj).forEach(key => { 
    let metaInfo = {
      "key": key, 
      "keyType" : obj[key]
    }
    metadata.push(metaInfo);
  });
  return metadata;
}

router.post("/info", async function (req, res, next) {
  try {
    const { wsdlUri } = req.body;
    const client = await soap.createClientAsync(wsdlUri);
    const serviceOperations = extractOperationNames(client);
    extractModels(client);
    res.json({
      services: serviceOperations,
      metadata : extractModels(client)
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
