import * as yup from 'yup'
import onChange from 'on-change'
import render from './view.js'

const schema = yup.object().shape({
  url: yup.string().url().required().notOneOf(), // Добавить ошибки для сообщений
})

// schema.valid({url: new FormData(e.target)})

const app = () => {
  const initialState = {
    formState: {
      isValid: null,
      errors: {},
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
  const watchedState = onChange(initialState, () => render(watchedState)) // ?????

  const form = document.querySelector('.rss-form')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    if (schema.isValid({ url: formData })) {
      watchedState.formState.isValid = true
      watchedState.formState.errors = {}

      watchedState.processState.processStatus = 'sending'
      // и мы отправляем запрос на сервер.
      // Далее проверка валидации самого сайта что это rss url
      // От этого зависит статус 'failed', 'success'
    }
    else {
      watchedState.formState.isValid = false
      watchedState.formState.errors = { massage: 'Ссылка должна быть валидным URL' }
    }
  })
}

export default app
