import * as yup from 'yup'
import createFormWatcher from './watchers/formWatcher.js'
import createFeedsWatcher from './watchers/feedWatcher.js'
import axios from 'axios'
import parseRss from './rssParser.js'

yup.setLocale({
  mixed: {
    required: () => 'rss_form.error_messages.field_required',
    notOneOf: () => 'rss_form.error_messages.field_exists',
  },
  string: {
    url: () => 'rss_form.error_messages.not_valid',
  },
})

const createRssSchema = existingUrls => yup.string().url().required().notOneOf(existingUrls).strict()

const downloadRssFeed = (url, i18n) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => {
    console.log('Полный ответ:', JSON.stringify(response.data, null, 2))
    return parseRss(response.data.contents) // отправляем данные на парсинг
  })
  .catch((error) => {
    switch (error.code) {
      case 'ERR_NETWORK':
        throw new Error(i18n.t('rss_form.error_messages.network_error'))
      default:
        throw new Error(i18n.t('rss_form.error_messages.not_rss'))
    }
  })

const app = (i18n) => {
  const state = {
    formState: {
      isValid: null,
      errors: {}, // { message }
      // inputValue: '',
    },
    processState: {
      status: 'filling', // 'sending', 'failed', 'success'
      processErrors: {},
    },
    feedsData: {
      posts: [], // { id, linc, title, description, feedId }
      urls: [],
      feeds: [], // { id, title, discription }
    },
    uiState: {
      seenPost: [],
    },
  }

  const submitBtn = document.querySelector('[aria-label="add"]')
  const rssInput = document.querySelector('#url-input')
  const feedbackField = document.querySelector('.feedback')
  const form = document.querySelector('.rss-form')
  const postsRoot = document.querySelector('.posts')
  const feedsRoot = document.querySelector('.feeds')

  if (!feedsRoot || !postsRoot) {
    console.error('Не найдены элементы для рендеринга')
    return
  }

  const elements = {
    submitBtn,
    rssInput,
    feedbackField,
    form,
    postsRoot,
    feedsRoot,
  }

  const watchedFormState = createFormWatcher(state, i18n, elements)
  const watchedFeedsState = createFeedsWatcher(state.feedsData, state.uiState, elements, i18n)

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const inputValue = formData.get('url')

    const existingUrls = watchedFeedsState.urls
    const schema = createRssSchema(existingUrls)
    const validateForm = schema.validate(inputValue)

    validateForm
      .then(() => {
        watchedFormState.formState.isValid = true
        watchedFormState.formState.errors = {}
        watchedFormState.processState.status = 'sending'
        return downloadRssFeed(inputValue, i18n) // отправляем запрос на сервер.

        // Далее проверка валидации самого сайта что это rss url
      })
      .then((data) => {
        watchedFormState.processState.status = 'success'
        watchedFeedsState.urls.unshift(inputValue)
        watchedFeedsState.feeds.unshift(data.feed)
        watchedFeedsState.posts = [data.post, ...watchedFeedsState.posts]
        watchedFormState.processState.processErrors = {}
      })
      .catch((error) => {
        if (error instanceof yup.ValidationError) {
          watchedFormState.formState.isValid = false
          const errorMessage = i18n.t(error.message)
          console.log('error message = ', errorMessage)
          watchedFormState.formState.errors = { message: errorMessage }
          console.log('state = ', watchedFormState)
        }
        else {
          watchedFormState.processState.status = 'failed'
          const message = i18n.t(error.message)
          watchedFormState.processState.processErrors = { message }
          console.log('processState.processErrors = ', watchedFormState.processState.processErrors)
        }
      })
  })
}

export default app
