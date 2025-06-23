// config/api.ts
const API_CONFIG = {
  // URLs par environnement
  LOCAL: 'http://172.20.10.2:8000',
  DEVELOPMENT: 'http://192.168.1.13:8000', 
  PRODUCTION: 'http://gamepoint-app.alwaysdata.net',
};

const getApiUrl = () => {
  return API_CONFIG.PRODUCTION; 
};

export const API_URL = getApiUrl();
export const API_ENDPOINTS = {
  REGISTER: `${API_URL}/api/register`,
  LOGIN: `${API_URL}/api/login_check`,
  QR_CODE: `${API_URL}/api/user/qr-code`,
  SCAN: `${API_URL}/api/scan`,
  REWARDS: `${API_URL}/api/rewards`,
  SHOP_REWARDS: `${API_URL}/api/shop/rewards`,
  SHOP: `${API_URL}/api/shops`,
  createShop: `${API_URL}/api/shop/create`,
  transaction: `${API_URL}/api/scan`,
  redeem: `${API_URL}/api/redeem`,
  myRewards: `${API_URL}/api/my-rewards`,
  loyality: `${API_URL}/api/loyalty`,
  userinfos: `${API_URL}/api/me`,
  validateRewards: `${API_URL}/api/validate-reward`,
  ME : `${API_URL}/api/me`


};