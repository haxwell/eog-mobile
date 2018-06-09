
export const domainInfo = {
  domain: '104.236.210.35', // staging  
  port: '8080'
};

export const domainPort = domainInfo.domain + ':' + domainInfo.port;

export const environment = {
  production: false,
  domainPort: domainPort,
  apiUrl: 'http://' + domainPort
};
