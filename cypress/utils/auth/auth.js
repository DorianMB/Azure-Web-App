// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import * as msal from "@azure/msal-node";
import AUTH_DATA from "./auth.config.js";
console.log('AUTH_DATA');
console.log(AUTH_DATA);

// Get a Key value store object and set its content in the local storage
async function setAuthDataInLocalStorage(tokenCache) {
  console.log('--setAuthDataInLocalStorage--');
  console.log('tokenCache');
  console.log(tokenCache);
  const cacheKeys = Object.keys(tokenCache);
  for (let key of cacheKeys) {
    const value = JSON.stringify(tokenCache[key]);
    window.localStorage.setItem(key, value);
  };
  // await page.reload();
}

export async function logIn() {
  // Log in with auth data in set configuration file
  const pca = new msal.PublicClientApplication(AUTH_DATA.CONFIG);
  const usernamePasswordRequest = {
      scopes: ["user.read"],
      username: AUTH_DATA.USERNAME,
      password: AUTH_DATA.PASSWORD
  };

  try {
    await pca.acquireTokenByUsernamePassword(usernamePasswordRequest);
  } catch(err) {
    console.log('--ERROR--');
    alert(err);
    console.log('---------');
  }

  // Get the auth data from cache
  let tokenCache = pca.getTokenCache().getKVStore();
  // Write auth data in local storage
  setAuthDataInLocalStorage(tokenCache);
  // await page.goto('http://localhost:30662');
};
