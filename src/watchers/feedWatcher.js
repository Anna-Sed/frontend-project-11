import onChange from 'on-change'
import renderFeeds from './../render/renderFeeds.js'
import renderPosts from './../render/renderPosts.js'

const createFeedsWatcher = (feedsData, uiState, elements, i18n) => {
  const { postsRoot, feedsRoot } = elements
  return onChange(feedsData, (path, value) => {
    // console.log('путь  = ', path, `и значение = ${value}`)
    switch (path) {
      case 'posts':
        renderPosts(value, uiState.seenPost, postsRoot, i18n)
        break
      case 'feeds':
        renderFeeds(value, feedsRoot, i18n)
        break
      case 'urls':
        // console.log('Изменились URL:', value)
        break
      default:
        throw new Error(`Unexpected path in feedWatcher: ${path}`)
    }
  })
}

export default createFeedsWatcher
