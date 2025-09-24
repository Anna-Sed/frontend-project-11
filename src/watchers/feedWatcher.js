import onChange from 'on-change'

const createConteiner = (root, title) => {
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const childrenHtml = `<div class="card-body">
      <h2 class="card-title h4">${title}</h2>
    </div> 
    <ul class="list-group border-0 rounded-0"></ul>
  `
  card.innerHTML = childrenHtml
  root.replaceChildren(card)
  return card
}

const renderFeeds = (feeds, feedsRoot) => {
  console.log('Рендерим фиды:', feeds)
  const conteiner = createConteiner(feedsRoot, 'Фиды')
  const ul = conteiner.querySelector('ul')

  const liItems = feeds.map((feed) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')
    const liChild = `<h3 class="h6 m-0">${feed.title}</h3>
    <p class="m-0 small text-black-50">${feed.description}</p>
    `
    li.append(liChild)
    return li
  })

  ul.append(...liItems)
}

const createPostItem = (post, seenPost, i18n) => {
  const { id, link, title, description } = post
  const a = document.createElement('a')
  const postClass = seenPost.includes(id) ? ['fn-normal', 'link-secondary'] : ['fw-bold']
  a.classList.add(...postClass)
  a.setAttribute('data-id', id)
  a.setAttribute('target', '_blank')
  a.textContent = title
  a.href = link
  a.addEventListener('click', () => seenPost.push(id))

  const button = document.createElement('button')
  button.type = 'button'
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
  button.setAttribute('data-id', id)
  button.setAttribute('data-bs-toggle', 'modal')
  button.setAttribute('data-bs-target', '#modal')
  button.textContent = i18n.t('post_button')
  button.dataset.bsTitle = title
  button.dataset.bsDescription = description
  button.dataset.bsLink = link

  const li = document.createElement('li')
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
  li.append(a, button)
  return li
}

const renderPost = (posts, seenPost, postsRoot, i18n) => {
  console.log('Рендерим посты:', posts)
  if (posts.length === 0) {
    postsRoot.innerHtml = ''
    return
  }
  const conteiner = createConteiner(postsRoot, 'Посты')
  const ul = conteiner.querySelector('ul')
  const liItems = posts.map(post => createPostItem(post, seenPost, i18n))
  ul.append(...liItems)
}

const createFeedsWatcher = (feedsData, uiState, elements, i18n) => {
  const { postsRoot, feedsRoot } = elements
  return onChange(feedsData, (value, path) => {
    switch (path) {
      case 'posts':
        renderPost(value, uiState.seenPost, postsRoot, i18n)
        break
      case 'feeds':
        renderFeeds(value, feedsRoot)
        break
      case 'urls':
        break
      default:
        throw new Error(`Unexpected path in feedWatcher: ${path}`)
    }
  })
}

export default createFeedsWatcher
