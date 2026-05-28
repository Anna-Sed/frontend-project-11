// Рендер формы в зависимости от статуса процесса - успех, заполнение, отправка
// передача ошибки именно из processState

export default (processStatus, errors, elements, i18n) => {
  const { rssInput, feedbackField, submitBtn } = elements
  switch (processStatus) {
    case 'filling':
      break
    case 'failed':
      submitBtn.disabled = false
      rssInput.disabled = false
      rssInput.classList.add('is-invalid')
      feedbackField.classList.add('text-danger')
      feedbackField.textContent = errors.message
      break
    case 'success':
      submitBtn.disabled = false
      rssInput.disabled = false
      feedbackField.textContent = i18n.t('rss_form.success_message')
      feedbackField.classList.remove('text-danger')
      rssInput.classList.remove('is-invalid')
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
