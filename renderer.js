const magsearch = (module.exports = {});
const request = require('request');
const cheerio = require('cheerio');
const agent = require('socks5-http-client/lib/Agent');
const spawn = require('child_process').spawn;

let options = {};
const sHost = '127.0.0.1';
const sPort = 9050;
const plat = process.platform;

magsearch.attr = {
  title: [],
  mag: [],
  size: [],
  seeders: [],
  peers: [],
  leechers: [],
  url: ''
};

function parsequery(str) {
  let ret = '';
  for (let tmp = 0; tmp < str.length; tmp++) {
    if (str.charAt(tmp) === ' ') {
      ret += '%20';
    } else if (tmp === str.length - 1) {
      ret += str.charAt(tmp);
      return ret;
    } else {
      ret += str.charAt(tmp);
    }
  }
}

// magsearch.gethealth = function(i, callback) {
//   const a = i;
//   health(magsearch.attr.mag[a])
//     .then(function(health) {
//       magsearch.attr.seeders[a] = ' ' + health.seeds;
//       magsearch.attr.peers[a] = ' ' + health.peers;
//       return callback(1);
//     })
//     .catch(function(err) {
//       console.error(err);
//       return callback(1);
//     });
// };

magsearch.clearattr = function() {
  magsearch.attr.title = [];
  magsearch.attr.mag = [];
  magsearch.attr.seeders = [];
  magsearch.attr.peers = [];
  magsearch.attr.leechers = [];
  magsearch.attr.size = [];
  magsearch.attr.url = '';
};

outoftime = function() {
  console.log(
    '\nResponse timeout!\nIf you are using a socks make sure it is configured properly.\n'
  );
  process.exit(0);
};

magsearch.pbay = function(params, callback) {
  magsearch.clearattr();
  const qq = parsequery(params.query);
  let kk = '';

  switch (params.keyword) {
    case 'all':
      kk = 0;
      break;
    case 'video':
      kk = 200;
      break;
    case 'audio':
      kk = 100;
      break;
    case 'adult':
      kk = 500;
      break;
    case 'applications':
      kk = 300;
      break;
  }

  if (Boolean(params.socks.enabled)) {
    if (
      parseInt(params.socks.port) === 9150 ||
      parseInt(params.socks.port) === 9050
    ) {
      options = {
        url: `http://uj3wazyk5u4hnvtk.onion/search/${qq}/${Math.floor(
          params.page / 2
        )}/7/${kk}`,
        agentClass: agent,
        agentOptions: {
          socksHost: params.socks.host, // Defaults to 'localhost'.
          socksPort: parseInt(params.socks.port), // Defaults to 1080.
          rejectUnauthorized: false
        }
      };
    } else {
      options = {
        url: `https://thepiratebay.org/search/${qq}/${Math.floor(
          params.page / 2
        )}/7/${kk}`,
        agentClass: agent,
        agentOptions: {
          socksHost: params.socks.host, // Defaults to 'localhost'.
          socksPort: parseInt(params.socks.port), // Defaults to 1080.
          rejectUnauthorized: false
        }
      };
    }
  } else {
    options = {
      url: `https://thepiratebay.org/search/${qq}/${Math.floor(
        params.page / 2
      )}/7/${kk}`
    };
  }

  request(options, function(error, response, html) {
    let i = 0;
    if (error) {
      return callback(error);
    }

    if (!error) {
      const $ = cheerio.load(html);
      $('#searchResult').filter(function() {
        console.log($(this).html());
        let tr = $(this).find('tr');

        $(tr).each(function(a, b) {
          if ($('.detName', b).text() !== '') {
            magsearch.attr.title.push(
              $('.detName', b)
                .text()
                .trim()
                .replace('{', '')
                .replace('}', '')
            );

            magsearch.attr.mag.push(
              $(b)
                .children()
                .eq(1)
                .children()
                .eq(1)
                .attr('href')
            );

            magsearch.attr.seeders.push(
              ' ' +
                $(b)
                  .children()
                  .eq(2)
                  .text()
            );

            magsearch.attr.leechers.push(
              ' ' +
                $(b)
                  .children()
                  .eq(3)
                  .text()
            );
          }
        });
      });
    }
    magsearch.attr.url = options.url;
    console.log(magsearch.attr);
    return callback(magsearch.attr);
  });
};

magsearch.launchPF = function(settings, callback) {
  let tc = 0;
  const finSpawn = function() {
    clearInterval(tcInterval);
    if (settings.path !== 'tmp') {
      list.push('--path=' + settings.path);
    }
    if (settings.player !== 'none') {
      list.push(settings.player);
    }
    if (plat === 'win32') {
      list.unshift('/c', 'peerflix');
      pf = spawn('cmd', list, { stdio: 'inherit' });
    } else {
      console.log(list);
      pf = spawn('peerflix', list, { stdio: 'inherit' });
    }
  };

  const tcInterval = setInterval(function() {
    if (tc === 2) {
      finSpawn();
    }
  }, 1250);

  const blist = 'auto';
  let list = [];

  list.push(settings.magnet);

  list.push('--all');

  if (blist === 'auto') {
    if (plat !== 'win32') {
      list.push('--blocklist=./btlev1');
    } else {
      list.push('--blocklist=btlev1');
    }
    tc++;
  } else {
    if (blist !== undefined) {
      list.push('--blocklist=' + blist);
    }
    tc++;
  }
  tc++;
};
