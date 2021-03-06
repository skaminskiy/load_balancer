var routing = [{
    path: '/api',
    service: 'api-service',
    index: 0
  },{
    path: '/',
    service: 'chat',
    index: 0
  }];

var httpProxy = require('http-proxy');
var seaport = require('seaport').connect('localhost', 9090);

var proxy = httpProxy.createProxyServer({
  ws: true
});
var proxyServer = require('http').createServer(function(req, res) {
  var route;
  routing.some(function(entry) {
    route = entry;
    //Starts with the route path?
    return req.url.indexOf(route.path) === 0;
  });
  
  var servers = seaport.query(route.service);
  if(!servers.length) {
    res.writeHead(502);
    return res.end('Bad gateway');
  }

  route.index = (route.index + 1) % servers.length;

  console.log('web---> ' + route.index);
  proxy.web(req, res, {target: servers[route.index]});
}); //.listen(8080, function() {console.log('Started');});

proxyServer.on('upgrade', function (req, socket, head) {

  var route;
  routing.some(function(entry) {
    route = entry;
    //Starts with the route path?
    return req.url.indexOf(route.path) === 0;
  });
  
  var servers = seaport.query(route.service);
  // if(!servers.length) {
  //   res.writeHead(502);
  //   return res.end('Bad gateway');
  // }

  route.index = (route.index + 1) % servers.length;

  console.log('ws---> ' + route.index);
  proxy.ws(req, socket, {target: servers[route.index]});
});

proxyServer.listen(8080, function() {console.log('Started');});



