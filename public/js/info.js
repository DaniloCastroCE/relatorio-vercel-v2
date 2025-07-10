const info = document.querySelector('.info')

info.classList.add('info-show')

setTimeout(() => {
    info.classList.remove('info-show')
}, 10000)