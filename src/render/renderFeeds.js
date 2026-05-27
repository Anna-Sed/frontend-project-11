import createConteiner from './createContainer.js'

export default (feeds, feedsRoot, i18n) => {
  // console.log('Рендерим фиды:', feeds)
  const feedsTitle = i18n.t('feeds_title')
  const conteiner = createConteiner(feedsRoot, feedsTitle)
  const ul = conteiner.querySelector('ul')

  const liItems = feeds.map((feed) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')
    const liChild = `<h3 class="h6 m-0">${feed.title}</h3>
      <p class="m-0 small text-black-50">${feed.description}</p>
      `
    li.innerHTML = liChild
    return li
  })
  ul.append(...liItems)
}
