'use strict';

const fs = require('fs');
const path = require('path');


const appDir = fs.realpathSync(process.cwd());
const dotenv = require('dotenv').config({path: path.join(appDir, '.approvalworkflows')});
const { CMA_KEY } = process.env;

const { createLogger, format, transports} = require('winston');
const { combine, json, prettyPrint } = format;
const filename = path.join(__dirname, '..', 'logs', 'event.log');

// Create a clean version of the log file.
try { fs.unlinkSync(filename); }
catch (ex) { }

const logger = createLogger({
  format: json(),
  transports: [
    new transports.File({ filename })
  ]
});

const contentful = require('contentful-management')
const client = contentful.createClient({
  accessToken: CMA_KEY
})

const getContentType = async (entry) => {
  let ct;

  await client.getSpace(entry.sys.space.sys.id)
    .then((space) => space.getEnvironment(entry.sys.environment.sys.id))
    .then((environment) => environment.getContentType(entry.sys.contentType.sys.id))
    .then(contentType => ct = contentType)

  return ct;
}

exports.index = (req, res, next) => {
  var entry = req.body || '';

  if (entry) {
    getContentType(entry);
    res.send('something');
    // logger.log('info', 'Request:', {req});
  }
  // logger.log('info', 'process_env', {processEnv: process.env})
}
