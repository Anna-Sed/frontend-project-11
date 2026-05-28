import _ from 'lodash'

export default (xmlContent) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlContent, 'text/xml')
  // console.log('content = ', xmlContent)
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Ресурс не содержит валидный RSS')
  }

  const feedTitle = doc.querySelector('title').textContent
  const feedDescription = doc.querySelector('description').textContent
  const feedId = _.uniqueId()
  const feed = {
    id: feedId,
    title: feedTitle,
    description: feedDescription,
  }

  const items = doc.querySelectorAll('item')
  const posts = [...items].map((item) => {
    return {
      id: _.uniqueId(),
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
      feedId,
    }
  })
  // console.log('Возвращаемые данные:', { feed, posts })
  return { feed, posts }
}
