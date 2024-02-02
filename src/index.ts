(!process.argv.find(arg => arg.includes('ts-node'))) && require('module-alias/register')

import Core from '@/core/Core'
import ApiModule from '@/modules/api/ApiModule'

new Core(new ApiModule())