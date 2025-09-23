import onChange from 'on-change'

const handleProcess = (processState, errors, elements, i18n) => { // передача ошибки именно из processState
  const { rssInput, feedbackField, submitBtn } = elements
  switch (processState) {
    case 'filling':
      break
    case 'failed':
      submitBtn.disabled = false
      rssInput.disabled = false
      feedbackField.classList.add('text-danger')
      feedbackField.textContent = errors.message
      break
    case 'success':
      submitBtn.disabled = false
      rssInput.disabled = false
      feedbackField.textContent = i18n.t('rss_form.success_message')
      feedbackField.classList.remove('text-danger')
      rssInput.focus()
      rssInput.value = ''
      break
    case 'sending':
      submitBtn.disabled = true
      rssInput.disabled = true
      break
    default:
      throw new Error(`Unexpected process state: ${processState}`)
  }
}

const handleIsValid = (isValid, elements, errors) => { // передача ошибки именно валидации из formState
  const { rssInput, feedbackField } = elements
  if (isValid) {
    feedbackField.textContent = ''
    rssInput.classList.remove('is-invalid')
    rssInput.classList.add('is-valid')
  }
  else {
    rssInput.classList.add('is-invalid')
    console.log('error in view =', errors.message)
    feedbackField.classList.add('text-danger')
    feedbackField.textContent = errors.message
    console.log('text content = ', feedbackField.textContent)
  }
}

const createFormWatcher = (state, i18n, elements) => {
  const { formState, processState } = state
  return onChange(state, (path, value) => {
    switch (path) {
      case 'formState.errors':
        // Проверяем валидность: если message пустое или отсутствует, форма считается валидной
        handleIsValid(!value.message, elements, value)
        break
      case 'formState.isValid':
        handleIsValid(value, elements, formState.errors)
        break
      case 'processState.status':
        handleProcess(value, processState.processErrors, elements, i18n)
        break
      default:
        throw new Error(`Unexpected path: ${path}`)
    }
  })
}

export default createFormWatcher
