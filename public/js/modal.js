function makeModal(el, options={}) {
    const div = document.createElement('div')
    div.className = 'modal'
    div.append(...el.children)
    el.classList.add("glass", "hidden")
    el.append(div)

    let delay

    function toggle() {
        clearTimeout(delay)
        el.classList.toggle("hidden")
        document.querySelector("main").classList.toggle("blured")
        if (options.autoHide && !el.classList.contains('hidden'))
            delay = setTimeout(toggle, options.autoHide * 1000)
    }

    el.onclick = function (e) {
        if (e.target == this) toggle()
    }

    const btns = el.querySelectorAll('button')
    btns.forEach(btn => btn.onclick = toggle)

    if (options.fns) options.fns.forEach((fn, i) => btns[i].onclick = () => {
        fn()
        toggle()
    })

    if (options.autoShow) setTimeout(toggle, options.autoShow * 1000)

    return toggle
}