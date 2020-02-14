const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()

const defaultConfig = require('./config')

let aliaFileName = '.floaty.json'

const configPath = path.join(homedir, aliaFileName)

let config
if (fs.existsSync(configPath)) {
  config = require(configPath)
} else {
  write()
}

function write(conf = null) {
  config = conf || config || defaultConfig
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

module.exports = { config, write, configPath, defaultConfig }
