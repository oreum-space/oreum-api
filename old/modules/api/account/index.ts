import ApiModule from '../../../api-core/ApiModule'
import UserController from './controllers/AccountController'

export default function (module: ApiModule) {
  module.route('/account/create').post(UserController.create)
  module.route('/account/login').post(UserController.login)
  module.route('/account/logout').post(UserController.logout)
  module.route('/account/refresh').post(UserController.refresh)
  module.route(/^\/account\/activate\/[0-9a-f]{24}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .post(UserController.activate)

  module.route('/account/accounts').get(UserController.accounts)
}