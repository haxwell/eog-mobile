
export const domainInfo = {
  domain: 'localhost',
  port: '8080'
};

export const domainPort = domainInfo.domain + ':' + domainInfo.port;

export const environment = {
  domainPort: domainPort,
  apiUrl: 'http://' + domainPort
};
