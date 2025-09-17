import 'bootstrap/dist/css/bootstrap.min.css'
import app from './app.js'
import i18next from 'i18next'
import resources from './locales/index'

const runApp = async () => {
  const defaultLang = 'ru'
  const i18n = i18next.createInstance()
  await i18n.init({
    lng: defaultLang,
    debug: true,
    resources,
  })
  app(i18n)
}

runApp()
