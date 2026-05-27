export default (state, i18n, elements) => {
  console.log('Рендер модального окна')
  const { modalContainer } = elements

  const modalReadBtn = modalContainer.querySelector('.read_btn')
  const modalCloseBtn = modalContainer.querySelector('.close_btn')
  const modalTitle = modalContainer.querySelector('.modal-title')
  const modalBody = modalContainer.querySelector('.modal-body')

  modalCloseBtn.textContent = i18n.t('modal.modal_btn_close')
  modalReadBtn.textContent = i18n.t('modal.modal_btn_reed_post')

  const { modalId } = state.uiState
  const currentPost = state.feedsData.posts.find(post => post.id === modalId)
  const { title, description, link } = currentPost
  modalTitle.textContent = title
  modalBody.textContent = description

  const handleClick = () => {
    window.open(link, '_blank', 'noopener, noreferrer')
  }

  modalReadBtn.addEventListener('click', handleClick)
}
