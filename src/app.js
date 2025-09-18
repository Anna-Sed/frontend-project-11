import * as yup from 'yup'
import createFormWatcher from './view.js'

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

const app = (i18n) => {
  const state = {
    formState: {
      isValid: null,
      errors: {}, // { message }
      inputValue: '', // ???
    },
    processState: {
      status: 'filling', // 'sending', 'failed', 'success'
      processErrors: {},
    },
    ui: {
      seenPost: [],
      posts: [], // { id, url }
    },
  }

  const submitButton = document.querySelector('[aria-label="add"]')
  const rssInput = document.querySelector('#url-input')
  const feedbackField = document.querySelector('.feedback')
  const form = document.querySelector('.rss-form')

  const elements = {
    submitButton,
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

    validateForm.then(() => {
      watchedState.formState.isValid = true
      watchedState.formState.errors = {}
      watchedState.processState.status = 'sending'
      // и мы отправляем запрос на сервер.
      // Далее проверка валидации самого сайта что это rss url
      // От этого зависит статус 'failed', 'success'
      watchedState.processState.status = 'success'
    })
      .catch((error) => {
        watchedState.formState.isValid = false
        // watchedState.processState.status = 'failed'
        const errorMessage = i18n.t(error.message)
        console.log('error message = ', errorMessage)
        watchedState.formState.errors = { message: errorMessage }
        console.log('state = ', watchedState)
      })
  })
}

export default app
