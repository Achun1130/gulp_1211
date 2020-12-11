let envOpts = {
    string: 'env',
    default: {env: 'develop'}
}

const opts = require('minimist')(process.argv.slice(2), envOpts);

exports.opts = opts;