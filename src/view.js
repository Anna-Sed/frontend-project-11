const render = (state) => {
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
    feedbackField.textContent = formState.errors.massage
  }
}

export default render
