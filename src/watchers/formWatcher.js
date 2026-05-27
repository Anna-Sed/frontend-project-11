import onChange from 'on-change'
import createModal from './../render/createModal.js'
import handleProcess from './../render/handleProcess.js'
import handleIsValid from './../render/handleIsValid.js'

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
        // console.log('Запуск рендера из вотчера формы')
        createModal(state, i18n, elements)
        break
      default:
        throw new Error(`Unexpected path in formWatcher: ${path}`)
    }
  })
}

export default createFormWatcher
