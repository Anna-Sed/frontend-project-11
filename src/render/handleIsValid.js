// Рендер формы в зависимости от валидации
// передача ошибки именно валидации из formState

export default (isValid, elements, errors) => {
  const { rssInput, feedbackField } = elements
  if (isValid) {
    feedbackField.textContent = ''
    rssInput.classList.remove('is-invalid')
  }
  else {
    rssInput.classList.add('is-invalid')
    // console.log('error in view =', errors.message)
    feedbackField.classList.add('text-danger')
    feedbackField.textContent = errors.message
    // console.log('text content = ', feedbackField.textContent)
  }
}
