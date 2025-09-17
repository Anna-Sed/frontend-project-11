const render = (state, i18n) => {
  const { formState } = state

  // const submitButton = document.querySelector('[aria-label="add"]')
  const rssInput = document.querySelector('#url-input')
  const feedbackField = document.querySelector('.invalid-feedback')

  if (formState.isValid) {
    feedbackField.textContent = ''
    rssInput.classList.remove('is-invalid')
    rssInput.classList.add('is-valid')
  }
  else {
    rssInput.classList.add('is-invalid')
    console.log('error in view =' ,formState.errors.message)
    feedbackField.textContent = formState.errors.message
  }
}

export default render
