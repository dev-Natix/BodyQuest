function initProfileMenu() {
  const profileBtn = document.getElementById('profileBtn')
  const profileMenu = document.getElementById('profileMenu')

  if (!profileBtn || !profileMenu) return

  profileBtn.addEventListener('click', function (event) {
    event.stopPropagation()
    const isOpen = profileMenu.classList.toggle('is-open')
    profileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
  })

  document.addEventListener('click', function () {
    if (profileMenu.classList.contains('is-open')) {
      profileMenu.classList.remove('is-open')
      profileBtn.setAttribute('aria-expanded', 'false')
    }
  })
}

document.addEventListener('DOMContentLoaded', function () {
  const includes = document.querySelectorAll('[data-include]')
  const promises = []

  includes.forEach(function (el) {
    const url = el.getAttribute('data-include')
    promises.push(
      fetch(url)
        .then(function (response) {
          return response.text()
        })
        .then(function (html) {
          el.innerHTML = html
        })
    )
  })

  Promise.all(promises).then(function () {
    initProfileMenu()
  })
})
