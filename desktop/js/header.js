/*
  顶部导航交互
  =========================================================
  1. 首页顶部：.is-home-top
  2. 离开顶部：.is-scrolled
  3. Header Hover 深色与双 Logo 切换交给 CSS
  4. 搜索按钮目前只实现搜索框 UI 开合
*/

document.addEventListener("DOMContentLoaded", () => {

    const header =
        document.getElementById("siteHeader");

    const searchBtn =
        document.getElementById("headerSearchBtn");

    const searchPanel =
        document.getElementById("headerSearchPanel");

    const searchInput =
        document.getElementById("headerSearchInput");

    const searchClose =
        document.getElementById("headerSearchClose");


    if (!header) {
        return;
    }


    let ticking = false;


    function updateHeaderState() {

        const atHomeTop =
            window.scrollY <= 24;


        header.classList.toggle(
            "is-home-top",
            atHomeTop
        );


        header.classList.toggle(
            "is-scrolled",
            !atHomeTop
        );


        ticking = false;
    }


    function requestHeaderUpdate() {

        if (ticking) {
            return;
        }

        ticking = true;

        requestAnimationFrame(
            updateHeaderState
        );
    }


    function openSearch() {

        if (!searchPanel) {
            return;
        }

        searchPanel.classList.add(
            "is-open"
        );

        searchPanel.setAttribute(
            "aria-hidden",
            "false"
        );

        if (searchBtn) {

            searchBtn.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        setTimeout(() => {

            if (searchInput) {
                searchInput.focus();
            }

        }, 120);
    }


    function closeSearch() {

        if (!searchPanel) {
            return;
        }

        searchPanel.classList.remove(
            "is-open"
        );

        searchPanel.setAttribute(
            "aria-hidden",
            "true"
        );

        if (searchBtn) {

            searchBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    }


    updateHeaderState();


    window.addEventListener(
        "scroll",
        requestHeaderUpdate,
        {
            passive:true
        }
    );


    window.addEventListener(
        "resize",
        requestHeaderUpdate,
        {
            passive:true
        }
    );


    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const opened =
                    searchPanel &&
                    searchPanel.classList.contains(
                        "is-open"
                    );


                if (opened) {
                    closeSearch();
                } else {
                    openSearch();
                }

            }
        );

    }


    if (searchClose) {

        searchClose.addEventListener(
            "click",
            closeSearch
        );

    }


    document.addEventListener(
        "click",
        event => {

            if (
                searchPanel &&
                !searchPanel.contains(
                    event.target
                ) &&
                searchBtn &&
                !searchBtn.contains(
                    event.target
                )
            ) {

                closeSearch();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeSearch();
            }

        }
    );

});
