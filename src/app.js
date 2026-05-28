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
      seenPost: [], // id-ишки
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
        const allPromisePosts = allFeedLinks
          .map((link) => {
            const proxyLink = addProxy(link)
            return axios.get(proxyLink).then(res => parseRss(res.data.contents)).then(({ posts }) => posts)
          })
        Promise.all(allPromisePosts)
          .then((allPosts) => {
            const newPosts = allPosts
              .flat()
              .filter((post) => {
                const { posts } = state.feedsData
                return !posts.find(el => el.link === post.link)
              })
            watchedFeedsState.posts = [...newPosts, ...state.feedsData.posts]
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
    watchedFormState.processState.status = 'sending'
    // Передаём в createRssSchema все наши урлы, которые уже добавлены
    const schema = createRssSchema(state.feedsData.urls)
    schema
      .validate(inputValue)
      .then(() => {
        watchedFormState.formState.isValid = true
        watchedFormState.formState.errors = {}
        watchedFormState.processState.processErrors = {}

        const urlWithProxy = addProxy(inputValue)
        console.log('urlWithProxy: ', urlWithProxy)
        return axios.get(urlWithProxy)
      })
      .then((response) => {
        const data = parseRss(response.data.contents)
        const { feed, posts } = data

        feed.resource = inputValue
        watchedFeedsState.feeds = [feed, ...watchedFeedsState.feeds]
        watchedFeedsState.posts = [...posts, ...watchedFeedsState.posts]
        watchedFeedsState.urls = [inputValue, ...watchedFeedsState.urls]
        watchedFormState.processState.status = 'success'
      })
      .catch((error) => {
        watchedFormState.processState.status = 'failed'
        switch (error.name) {
          case 'AxiosError':
            watchedFormState.processState.processErrors = {
              message: i18n.t('rss_form.error_messages.network_error'),
            }
            elements.rssInput.value = inputValue // ??? костыли
            break
          case 'ValidationError':
            watchedFormState.formState.isValid = false
            watchedFormState.formState.errors = { message: i18n.t(error.message) }
            break
          case 'ParseError':
            watchedFormState.formState.isValid = false
            watchedFormState.formState.errors = { message: i18n.t('rss_form.error_messages.not_rss') }
            elements.rssInput.value = inputValue // ??? костыли
            break
          default:
            console.log(`Unknown error: ${error}`)
            throw new Error(`Unknown error: ${error}`)
        }
      })
  })

  elements.postsRoot.addEventListener('click', (e) => {
    if (!event.target.dataset.id) return

    const postId = e.target.dataset.id
    watchedFormState.uiState.modalId = postId

    if (!state.uiState.seenPost.includes(postId)) {
      state.uiState.seenPost.push(postId)
    }
  })
}

export default app
