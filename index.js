var Hapi = require('hapi');
var Nipple = require('nipple');

var server = Hapi.createServer('localhost', 8000, {
  cache: 'catbox-redis'
});

getNasaData = function(count, next) {
  var url = 'http://data.nasa.gov/api/get_recent_datasets/?count=' + count;
  Nipple.get(url, function (err, res, payload) {
    console.log("Getting data... Count: " + count)
    if (err) {
      next(err);
    } else {
      next(null, JSON.parse(payload));
    }
  });
};

SECOND = 1000;
MINUTE = 60 * SECOND;
server.method('getNasaData', getNasaData, {
  cache: {
    expiresIn: 60 * MINUTE,
    staleIn: 10 * SECOND,
    staleTimeout: 100
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    var count = request.query.count || 10;
    server.methods.getNasaData(count, function(error, result) {
      reply(error || result);
    });
  }
});

server.start();
console.log("Listening on: " + server.info.uri);