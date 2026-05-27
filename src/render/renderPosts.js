import createConteiner from './createContainer.js'
import createPostItem from './postItem.js'

export default (posts, seenPost, postsRoot, i18n) => {
  // console.log('Рендерим посты:', posts)
  if (posts.length === 0) {
    postsRoot.innerHtml = ''
    return
  }

  const postsTitle = i18n.t('posts_title')
  const conteiner = createConteiner(postsRoot, postsTitle)
  const ul = conteiner.querySelector('ul')
  const liItems = posts.map(post => createPostItem(post, seenPost, i18n))
  ul.append(...liItems)
}
