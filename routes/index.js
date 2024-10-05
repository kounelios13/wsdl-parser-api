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

router.post("/info", async function (req, res, next) {
  try {
    const { wsdlUri } = req.body;
    const client = await soap.createClientAsync(wsdlUri);
    const serviceOperations = extractOperationNames(client);
    res.json({
      services: serviceOperations,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
