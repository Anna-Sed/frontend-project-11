import onChange from 'on-change'
import modalRender from './modalRender'

// Рендер формы в зависимости от статуса процесса - успех, заполнение, отправка
const handleProcess = (processStatus, errors, elements, i18n) => { // передача ошибки именно из processState
  const { rssInput, feedbackField, submitBtn } = elements
  switch (processStatus) {
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
      throw new Error(`Unexpected process state: ${processStatus}`)
  }
}

// Рендер формы в зависимости от валидации
const handleIsValid = (isValid, elements, errors) => { // передача ошибки именно валидации из formState
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

// Запуск рендера формы в зависимости от изменения состояния (валидация или статус процесса)
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
      case 'processState.processErrors': {
        const status = Object.keys(value).length > 0 ? 'failed' : 'success'
        handleProcess(status, value, elements, i18n)
        break
      }
      case 'processState.status':
        handleProcess(value, processState.processErrors, elements, i18n)
        break
      case 'uiState.modalId':
        console.log('Запуск рендера из вотчера формы')
        modalRender(state, i18n, elements)
        break
      default:
        throw new Error(`Unexpected path in formWatcher: ${path}`)
    }
  })
}

export default createFormWatcher
