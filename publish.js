const ghpages = require('gh-pages');

ghpages.publish('dist', function (err) {
  if (!err) {
    console.log('\x1b[32m', 'Site is published!  ฅ^•ﻌ•^ฅ ');
  } else {
    console.err(err);
  }
});
