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

const addProxy = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get'
  const urlWithProxy = new URL(proxy)
  urlWithProxy.searchParams.append('disableCache', 'true')
  urlWithProxy.searchParams.append('url', url)
  return urlWithProxy
}

const downloadRssFeed = url => axios
  .get(addProxy(url))
  .then((response) => {
    // console.log('Полный ответ:', JSON.stringify(response.data, null, 2))
    return parseRss(response.data.contents)
  })
  .catch ((error) => {
    switch (error.code) {
      case 'ERR_NETWORK':
        throw new Error('rss_form.error_messages.network_error')
      default:
        throw new Error('rss_form.error_messages.not_rss')
    }
  })

const app = (i18n) => {
  const state = {
    formState: {
      isValid: null,
      errors: {}, // { message }
    },
    processState: {
      status: 'filling', // 'sending', 'failed', 'success'
      processErrors: {},
    },
    feedsData: {
      posts: [], // { id, link, title, description, feedId }
      urls: [], // Все загруженные ссылки rss
      feeds: [], // { id, title, discription }
    },
    uiState: {
      seenPost: [],
      modalId: null,
    },
  }

  const elements = {
    submitBtn: document.querySelector('[aria-label="add"]'),
    rssInput: document.querySelector('#url-input'),
    feedbackField: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    postsRoot: document.querySelector('.posts'),
    feedsRoot: document.querySelector('.feeds'),
    modalContainer: document.querySelector('.modal-content'),
  }

  const watchedFormState = createFormWatcher(state, i18n, elements)
  const watchedFeedsState = createFeedsWatcher(state.feedsData, state.uiState, elements, i18n)

  const interval = () => {
    setTimeout(() => {
      const allFeedLinks = state.feedsData.feeds.map(feed => feed.resource)
      if (allFeedLinks.length === 0) interval()
      else {
        // console.log('Все ссылки фидов в интервале', allFeedLinks)
        const allPromisePosts = allFeedLinks
          .map(link => downloadRssFeed(link)
            .then(({ posts }) => posts))
        // console.log('allPromisePosts в интервале: ', allPromisePosts)
        Promise.all(allPromisePosts)
          .then((allPosts) => {
            // console.log('Все посты в интервале после загрузки аксиос: ', allPosts)
            const newPosts = allPosts
              .flat()
              .filter((post) => {
                const { posts } = state.feedsData
                return !posts.find(el => el.link === post.link)
              })
            // console.log('Новые посты в интервале: ', newPosts)
            watchedFeedsState.posts = [...newPosts, ...state.feedsData.posts]
            // console.log('стейт с постами в интервале после добавления новых постов: ', state.feedsData.posts)
          })
          .catch((error) => {
            console.error('Ошибка при загрузке RSS-фидов:', error)
          })
          .then(() => interval())
      }
    }, 5000)
  }

  interval()

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const inputValue = formData.get('url').trim()

    const existingUrls = watchedFeedsState.urls
    const schema = createRssSchema(existingUrls)
    schema
      .validate(inputValue)
      .then(() => {
        watchedFormState.formState.isValid = true
        watchedFormState.formState.errors = {}
        watchedFormState.processState.processErrors = {}
        watchedFormState.processState.status = 'sending'
        return downloadRssFeed(inputValue) // отправляем запрос на сервер. zВозврат распарсенных данных
      })
      .then((data) => {
        const { feed, posts } = data
        watchedFormState.processState.status = 'success'
        feed.resource = inputValue
        watchedFeedsState.feeds = [feed, ...watchedFeedsState.feeds]
        watchedFeedsState.posts = [...posts, ...watchedFeedsState.posts]
        // console.log('стейт после получения данных с сервера = ', watchedFeedsState)
        // console.log('url = ', inputValue)
        watchedFeedsState.urls = [inputValue, ...watchedFeedsState.urls]
      })
      .catch((error) => {
        if (error instanceof yup.ValidationError) {
          watchedFormState.formState.isValid = false
          const errorMessage = i18n.t(error.message)
          // console.log('error message = ', errorMessage)
          watchedFormState.formState.errors = { message: errorMessage }
          // console.log('state form = ', watchedFormState)
        }
        else {
          watchedFormState.processState.status = 'failed'
          // console.log('ошибка сети до перевода - ', error.message)
          const message = i18n.t(error.message)
          // console.log('ошибка сети после перевода - ', message)
          watchedFormState.processState.processErrors = { message }
          // console.log('processState.processErrors = ', watchedFormState.processState.processErrors)
          // console.log('state feed = ', watchedFeedsState)

          if (message === 'Ресурс не содержит валидный RSS') {
            watchedFormState.formState.isValid = false
            watchedFormState.formState.errors = { message }
          }
        }
      })
  })

  elements.postsRoot.addEventListener('click', (e) => {
    if (!event.target.dataset.id) return

    const postId = e.target.dataset.id
    console.log('Нажатый пост: ', postId)
    watchedFormState.uiState.modalId = postId
    console.log('состояние модального айди: ', state.uiState.modalId)

    if (!state.uiState.seenPost.includes(postId)) {
      state.uiState.seenPost.push(postId)
    }
  })
}

export default app
