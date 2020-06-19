const toggleModal = makeModal(addWishModal)
addWishBtn.onclick = toggleModal
sendWishBtn.onclick = handleWish

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
            <a href=""><i class="fa fa-thumbs-up"></i> ${wish.rating}</a>
        </div>
    </li>`
}

function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}.${
        (date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear() % 100}`
}