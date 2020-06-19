const toggleModal = makeModal(addWishModal)
addWishBtn.onclick = toggleModal
sendWishBtn.onclick = handleWish

wishList.onclick = e => {
    const link = e.path.find(el => el.tagName == "A")
    if (link) {
        fetch('api/like', {
            method: "POST",
            body: link.id.slice(1)
        })

        link.lastElementChild.innerText = +link.lastElementChild.innerText + 1
        e.preventDefault()
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