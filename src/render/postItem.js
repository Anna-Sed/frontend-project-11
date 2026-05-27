export default (post, seenPost, i18n) => {
  const { id, link, title } = post
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

  const li = document.createElement('li')
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
  li.append(a, button)
  return li
}
