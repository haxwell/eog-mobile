
export const domainInfo = {
  domain: '165.227.109.239', // prod
  port: '8080'
};

export const domainPort = domainInfo.domain + ':' + domainInfo.port;

export const environment = {
  production: true,
  domainPort: domainPort,
  apiUrl: 'http://' + domainPort
};
