const toggleModal = makeModal(addWishModal)
addWishBtn.onclick = toggleModal
sendWishBtn.onclick = handleWish
document.body.onscroll = e => {
    if (document.documentElement.offsetHeight - innerHeight == scrollY) getMoreWishes()
}
getMoreBtn.onclick = getMoreWishes

let refreshInterval
refreshBtn.onclick = e => {
    if (e.shiftKey) {
        if (refreshBtn.classList.contains("active")) {
            clearInterval(refreshInterval)
            refreshBtn.classList.remove("active")
            delete localStorage.refresh
        }
        else {
            refreshInterval = setInterval(refresh, 15000)
            refreshBtn.classList.add("active")
            localStorage.refresh = true
        }
    } else refresh()
}

if (localStorage.refresh) {
    refreshInterval = setInterval(refresh, 15000)
    refreshBtn.classList.add("active")
}

document.querySelectorAll("details ul li a").forEach(a => a.onclick = handleSort)
document.querySelectorAll("a").forEach(a => a.addEventListener('click', e => e.preventDefault()))

wishList.onclick = e => {
    const link = e.path.find(el => el.tagName == "A")
    if (link) {
        fetch('api/like', {
            method: "POST",
            body: link.id.slice(1)
        })

        link.lastElementChild.innerText = +link.lastElementChild.innerText + 1
    }
}

function handleWish() {
    const wish = wishArea.value.trim()
    if (wish) {
        fetch('api/addwish', {
            method: "POST",
            body: wish
        }).then(res => res.json()).then(wish => wishList.innerHTML = buildWish(wish) + wishList.innerHTML)
        wishArea.value = ''
        toggleModal()
    }
}

function buildWish(wish) {
    return `<li class="wish">
        <b>${wish.text}</b>
        <div class="left">
            <p>${formatDate(new Date(wish.date))}</p>
            <a id="w${wish._id}" href=""><i class="fa fa-thumbs-up"></i> <span>${wish.rating}</span></a>
        </div>
    </li>`
}

function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}.${
        (date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear() % 100}`
}

function handleSort(e) {
    const [by, asc] = e.target.dataset.sort.split(',')
    fetch(`api/wishes?by=${by}&asc=${asc}`).then(res => res.json())
        .then(wishes => wishList.innerHTML = wishes.map(buildWish).join(''))
    sortBtn.open = false
    sortBtn.dataset.by = by
    sortBtn.dataset.asc = asc
    sortBtn.querySelector(".active").className = ''
    e.target.className = 'active'
}

function refresh() {
    const {by, asc} = sortBtn.dataset
    fetch(`api/wishes?by=${by}&asc=${asc}`).then(res => res.json())
        .then(wishes => wishList.innerHTML = wishes.map(buildWish).join(''))
}

function getMoreWishes() {
    const { by, asc } = sortBtn.dataset
    const offset = wishList.children.length
    fetch(`api/wishes?by=${by}&asc=${asc}&offset=${offset}`).then(res => res.json())
        .then(wishes => wishList.innerHTML += wishes.map(buildWish).join(''))
}