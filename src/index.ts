import UiModule from '@/modules/ui/UiModule'

(!process.argv.find(arg => arg.includes('ts-node'))) && require('module-alias/register')

import Core from '@/core/Core'
import ApiModule from '@/modules/api/ApiModule'
import AccountModule from '@/modules/account/AccountModule'
import LauncherModule from '@/modules/launcher/LauncherModule'

new Core(
  new ApiModule,
  new LauncherModule,
  new AccountModule,
  new UiModule
)
