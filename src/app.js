import * as yup from 'yup'
import createFormWatcher from './view.js'
import axios from 'axios';

yup.setLocale({
  mixed: {
    required: () => 'rss_form.error_messages.field_required',
    notOneOf: () => 'rss_form.error_messages.field_exists',
  },
  string: {
    url: () => 'rss_form.error_messages.not_valid',
  },
})

const createRssSchema = existingUrls => yup.string().url().required().notOneOf(existingUrls)

const downloadRssFeed = (url, i18n) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then(response => )// отправляем данные на парсинг в отдельную функцию
  .catch(error => {
    switch (error.code) {
      case 'ERR_NETWORK':
        throw new Error(i18n.t('rss_form.network_error'))
      default:
        throw new Error(i18n.t('rss_form.not_rss'))
    }
  })

const app = (i18n) => {
  const state = {
    formState: {
      isValid: null,
      errors: {}, // { message }
      // inputValue: '', // убрать ???
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
    ui: {
      seenPost: [],
    },
  }

  const submitBtn = document.querySelector('[aria-label="add"]')
  const rssInput = document.querySelector('#url-input')
  const feedbackField = document.querySelector('.feedback')
  const form = document.querySelector('.rss-form')

  const elements = {
    submitBtn,
    rssInput,
    feedbackField,
    form,
  }

  const watchedState = createFormWatcher(state, i18n, elements)

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const inputValue = formData.get('url')

    const existingUrls = watchedState.ui.posts.map(post => post.url)
    const schema = createRssSchema(existingUrls)
    const validateForm = schema.validate(inputValue)

    validateForm.catch((error) => {
        watchedState.formState.isValid = false
        const errorMessage = i18n.t(error.message)
        console.log('error message = ', errorMessage)
        watchedState.formState.errors = { message: errorMessage }
        console.log('state = ', watchedState)
      })
      .then(() => {
      watchedState.formState.isValid = true
      watchedState.formState.errors = {}
      watchedState.processState.status = 'sending'
      return downloadRssFeed(inputValue, i18n) // отправляем запрос на сервер.
      
      // Далее проверка валидации самого сайта что это rss url
    })
    .then((data) => {
      watchedState.processState.status = 'success'
      watchedState.feedsData.urls.unshift(inputValue) // feedsState
      watchedState.feedsData.feeds.unshift(data.feed)  // feedsState
      watchedState.formData.posts = [data.post, ...watchedState.formData.posts] // feedsState
    })
    .catch((error) => {
      watchedState.processState.status = 'failed'
      watchedState.processState.processErrors = error.message
    })
  })
}

export default app
