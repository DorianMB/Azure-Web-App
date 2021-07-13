// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

// TODO: import constants from src/configs
const AUTH_CLIENT_ID = '9e5d08f4-d8dd-471f-9cb6-b42d02271919';
const AUTH_AUTHORITY = 'https://login.microsoftonline.com/e413b834-8be8-4822-a370-be619545cb49';

const msalConfig = {
  // loginRequest: {
  //   scopes: ['user.read']
  // },
  auth: {
    clientId: AUTH_CLIENT_ID,
    authority: AUTH_AUTHORITY
  }//,
  // cache: {
  //   cacheLocation: 'localStorage',
  //   storeAuthStateInCookie: true
  // }
};

// Tests expect the following environment variables to be defined:
//  - SAMPLE_WEBAPP_AUTH_USERNAME: user name to use for MSAL authentication
//  - SAMPLE_WEBAPP_AUTH_PASSWORD: user password to use for MSAL authentication
const AUTH_USERNAME = process.env.SAMPLE_WEBAPP_AUTH_USERNAME;
const AUTH_PASSWORD = process.env.SAMPLE_WEBAPP_AUTH_PASSWORD;


module.exports = {
  CONFIG: msalConfig,
  USERNAME: AUTH_USERNAME,
  PASSWORD: AUTH_PASSWORD
};
