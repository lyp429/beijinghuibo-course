/*
  公共顶部导航状态
  =========================================================

  首页最顶部：
  .is-home-top

  离开最顶部：
  .is-scrolled

  Header 自己的 Hover 视觉完全交给 base.css，
  JS 这里只负责判断“当前是不是在首页最顶部”。
*/

document.addEventListener("DOMContentLoaded", () => {

    const header =
        document.getElementById("siteHeader");

    if (!header) {
        return;
    }


    let ticking = false;


    function updateHeaderState() {

        /*
          24px 内都认为仍处于首页最顶部，
          避免触摸板 / 浏览器产生 1~2px 微小滚动时反复闪动。
        */
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


    function requestUpdate() {

        if (ticking) {
            return;
        }

        ticking = true;

        requestAnimationFrame(
            updateHeaderState
        );

    }


    updateHeaderState();


    window.addEventListener(
        "scroll",
        requestUpdate,
        {
            passive:true
        }
    );


    window.addEventListener(
        "resize",
        requestUpdate,
        {
            passive:true
        }
    );

});
