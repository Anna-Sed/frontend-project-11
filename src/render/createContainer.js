export default (root, title) => {
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const childrenHtml = `<div class="card-body">
      <h2 class="card-title h4">${title}</h2>
    </div> 
    <ul class="list-group border-0 rounded-0"></ul>
  `
  card.innerHTML = childrenHtml
  root.replaceChildren(card)
  return card
}
