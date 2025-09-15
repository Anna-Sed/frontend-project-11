import * as yup from 'yup'
import onChange from 'on-change'
import render from './view.js'

const createRssSchema = (existingUrls) => yup.string()
  .url('Ссылка должна быть валидным URL')
  .required('Не должно быть пустым')
  .notOneOf(existingUrls, 'RSS уже существует')

const app = () => {
  const initialState = {
    formState: {
      isValid: null,
      errors: {},
      inputValue: '',
    },
    processState: {
      processStatus: 'filling', // 'sending', 'failed', 'success'
      processErrors: {},
    },
    ui: {
      seenPost: [],
      posts: [],
    },
  }
  const watchedState = onChange(initialState, () => render(watchedState))
  const form = document.querySelector('.rss-form')

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
      watchedState.processState.processStatus = 'sending'
      // и мы отправляем запрос на сервер.
      // Далее проверка валидации самого сайта что это rss url
      // От этого зависит статус 'failed', 'success'
    })
      .catch((error) => {
        watchedState.formState.isValid = false
        watchedState.formState.errors = { message: error.massage }
      })
  })
}

export default app
