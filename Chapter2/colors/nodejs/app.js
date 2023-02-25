var args = process.argv.slice(2);
var http=require('http');

var containerarch=process.platform;

//var containerip = require('os').networkInterfaces().eth0[0].address;

var ifaces = require('os').networkInterfaces();

var containerip = "";

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    containerip=containerip+" "+iface.address;
    ++alias;
  });
});

var containername=require('os').hostname();

var fs = require('fs');
var app_down_file = "/tmp/down";
var port=args[0];
var random_colors=["white","black","blue","red","grey","cyan","orange","yellow"]

var APP_VERSION="1.0";

var appdate=+new Date();

var color = process.env.COLOR

if ( !color ) {
  console.log('Color not defined, we will take a random one');
  color = random_colors[Math.floor(Math.random()*random_colors.length)];
}

console.log('APP_VERSION: ' + APP_VERSION + ' COLOR: '+color + ' CONTAINER NAME: ' + containername + ' CONTAINER IP: ' + containerip + ' CONTAINER ARCH: ' + containerarch);

http.createServer(function (req, res) {
  if (req.headers['x-forwarded-for']) {
    clientip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    clientip = req.connection.remoteAddress;
  } else {
    clientip = req.ip;
  }
  if (req.url == "/favicon.ico"){return;}
  if (req.url == "/health"){
    result='I am OK Thanks for asking.\n';
    if (fs.existsSync(app_down_file)){
      result='I am DOWN, thanks for asking\n';
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=UTF-8',
      'AppStatus': 'DOWN' });
    }else{
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8',
      'AppStatus': 'UP' });
    }
    console.log(result);
    res.write(result);
    res.end();
    return;
  }
  var headers=JSON.stringify(req.headers);
  if (req.url == "/text"){
    result='APP_VERSION: ' + APP_VERSION + 
      '\nCOLOR: ' + color + 
      '\nCONTAINER_NAME: ' + containername + 
      '\nCONTAINER_IP: ' + containerip + 
      '\nCLIENT_IP: ' + clientip +
      '\nCONTAINER_ARCH: ' + containerarch+
      '\n';
    console.log(result);
    res.write(result); 
    res.end();
    return;
  }
  if (req.url == "/headers"){
    console.log('HEADERS' + headers+'\n');
    res.write('HEADERS' + headers+'\n');   
    res.end();
    return;
  }
    fs.readFile('index.html', 'utf-8', function (err, result) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      result = result.replace('{{APP_VERSION}}', APP_VERSION);
      result = result.replace('{{CONTAINER_IP}}', containerip);
      result = result.replace('{{CONTAINER_NAME}}', containername);
      result = result.replace(new RegExp('{{COLOR}}', 'g'), color);
      console.log(result);
      res.write(result);
      // Closing response
      res.write('</body>\n');
      res.write('</html>\n');
      res.end();
    });


}).listen(port);






console.log('[' + appdate + ']  ' + containerip+' - '+containername);

console.log('Server running at http://'+containerip+':'+port+'/');

