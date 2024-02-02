import ApiModule from '../../api-core/ApiModule'

export default class UiModule extends ApiModule {
  constructor () {
    super('ui')
  }

  async create () {
    this.route('*').get(async apiStream => {
      if (apiStream.path === void 0 || !apiStream.path.includes('.')) {
        await apiStream.file('D:/Programming/Oreum/Web/oreum-ui-docs/dist/index.html')
        return
      }

      const splitPath = apiStream.path.split('.')

      const filepath = [splitPath.slice(0, -1).join('.'), splitPath.at(-1)?.split('/').at(0)].join('.')

      return apiStream.file(`D:/Programming/Oreum/Web/oreum-ui-docs/dist${ filepath }`)
    })
    await super.create()
  }
}