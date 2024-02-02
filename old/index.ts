import 'dotenv/config'
import ApiCore from './api-core/ApiCore'
import UiModule from './modules/ui-module/UiModule'
import ApiModule from './modules/api/ApiModule'

new ApiCore(
  new UiModule(),
  new ApiModule()
)
