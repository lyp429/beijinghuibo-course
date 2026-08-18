/*
  北京汇博智能实训基地｜电脑端公共逻辑
  =========================================================

  功能：
  1. 加载 5 个独立页面模块
  2. 初始化首页 Hero 交互
  3. 一滚一页翻页
  4. 刷新时回到首页
  5. 修复 #school / #enterprise / #talent / #ecosystem
     点击后被 scroll-snap 吸到错误页面的问题
  6. 所有站内锚点使用统一的平滑整页过渡，不再“闪现”
*/


// =====================================================
// 浏览器刷新定位
// =====================================================

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

const navigationEntry =
    performance.getEntriesByType("navigation")[0];

const isReloadNavigation =
    navigationEntry &&
    navigationEntry.type === "reload";

// 记录打开页面时自带的锚点
// 例如：index.html#industry
const requestedHash = location.hash;


// 只有刷新时才清除锚点
if (isReloadNavigation) {

    if (location.hash) {

        history.replaceState(
            null,
            "",
            location.pathname + location.search
        );

    }

    window.scrollTo(0, 0);

}


// =====================================================
// 加载 5 个模块
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const content =
            document.getElementById("site-content");

        const modules = [

            "./sections/hero.html",

            "./sections/industry.html",

            "./sections/courses.html",

            "./sections/about.html",

            "./sections/embodied.html"

        ];


        try {

            const htmlList =
                await Promise.all(

                    modules.map(
                        async file => {

                            const response =
                                await fetch(
                                    file,
                                    {
                                        cache: "no-store"
                                    }
                                );


                            if (!response.ok) {

                                throw new Error(
                                    file + " 加载失败"
                                );

                            }


                            return await response.text();

                        }
                    )

                );


            // 插入 5 个页面
            content.innerHTML =
                htmlList.join("\n");


            // 初始化第一页 Hero 交互
            if (
                typeof window.initHero === "function"
            ) {

                window.initHero();

            }


            // 浏览器完成布局后再初始化
            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    const pager =
                        initFullPageScroll();

                    initAnchorNavigation(pager);


                    // ==========================
                    // 初始定位
                    // ==========================

                    if (isReloadNavigation) {

                        pager.jumpToPage(0);

                    }

                    else if (requestedHash) {

                        const index =
                            pager.getPageIndexByHash(
                                requestedHash
                            );

                        if (index !== -1) {

                            pager.jumpToPage(index);

                        }

                        else {

                            pager.jumpToPage(0);

                        }

                    }

                    else {

                        pager.jumpToPage(0);

                    }

                });

            });


        }

        catch (error) {

            console.error(error);

            content.innerHTML = `

                <div class="site-load-error">

                    页面加载失败：

                    ${error.message}

                </div>

            `;

        }

    }
);



// =====================================================
// 整页翻页
// =====================================================

function initFullPageScroll() {

    const pages = [

        ...document.querySelectorAll(
            ".hero,.home-section"
        )

    ];


    if (!pages.length) {

        return null;

    }


    let currentPage = 0;

    let locked = false;

    let activeFrame = null;

    let animationId = 0;



    // =================================================
    // 找当前所在页
    // =================================================

    function getCurrentPage() {

        const y =
            window.scrollY;

        let index = 0;

        let distance =
            Infinity;


        pages.forEach(
            (page, i) => {

                const d =
                    Math.abs(
                        page.offsetTop - y
                    );


                if (d < distance) {

                    distance = d;

                    index = i;

                }

            }
        );


        return index;

    }



    // =================================================
    // 根据锚点判断它属于哪一整屏
    //
    // #industry   -> 第二屏
    // #school     -> 第二屏
    // #enterprise -> 第二屏
    // #talent     -> 第二屏
    // #ecosystem  -> 第二屏
    // =================================================

    function getPageIndexByHash(hash) {

        if (
            !hash ||
            hash === "#"
        ) {

            return -1;

        }


        let target;


        try {

            target =
                document.querySelector(hash);

        }

        catch (error) {

            return -1;

        }


        if (!target) {

            return -1;

        }


        const page =
            target.matches(
                ".hero,.home-section"
            )
                ? target
                : target.closest(
                    ".hero,.home-section"
                );


        if (!page) {

            return -1;

        }


        return pages.indexOf(page);

    }



    // =================================================
    // 立即定位
    // 用于第一次打开页面
    // =================================================

    function jumpToPage(index) {

        index =
            Math.max(
                0,
                Math.min(
                    index,
                    pages.length - 1
                )
            );


        currentPage =
            index;


        const html =
            document.documentElement;

        const oldSnap =
            html.style.scrollSnapType;

        const oldBehavior =
            html.style.scrollBehavior;


        // 暂时关闭吸附
        html.style.scrollSnapType =
            "none";

        html.style.scrollBehavior =
            "auto";


        window.scrollTo(
            0,
            pages[index].offsetTop
        );


        requestAnimationFrame(() => {

            html.style.scrollSnapType =
                oldSnap;

            html.style.scrollBehavior =
                oldBehavior;

        });

    }



    // =================================================
    // 平滑移动到指定整屏
    // =================================================

    function animateToPage(
        index,
        duration = 720,
        done = null
    ) {

        index =
            Math.max(
                0,
                Math.min(
                    index,
                    pages.length - 1
                )
            );


        animationId++;

        const myAnimationId =
            animationId;


        if (activeFrame) {

            cancelAnimationFrame(
                activeFrame
            );

        }


        const startY =
            window.scrollY;

        const targetY =
            pages[index].offsetTop;

        const distance =
            targetY - startY;


        // 已经接近目标位置
        if (
            Math.abs(distance) < 2
        ) {

            window.scrollTo(
                0,
                targetY
            );

            currentPage =
                index;

            locked =
                false;


            if (
                typeof done === "function"
            ) {

                done();

            }


            return;

        }


        locked =
            true;

        currentPage =
            index;


        const html =
            document.documentElement;

        const oldSnap =
            html.style.scrollSnapType;

        const oldBehavior =
            html.style.scrollBehavior;


        // 动画过程中关闭 scroll-snap
        html.style.scrollSnapType =
            "none";

        html.style.scrollBehavior =
            "auto";


        const startTime =
            performance.now();



        // 平滑缓动
        function ease(t) {

            return t < 0.5

                ? 4 * t * t * t

                : 1 -
                  Math.pow(
                      -2 * t + 2,
                      3
                  ) / 2;

        }



        function step(now) {

            // 如果出现新的动画
            // 旧动画立即结束
            if (
                myAnimationId !==
                animationId
            ) {

                return;

            }


            const progress =
                Math.min(
                    1,
                    (now - startTime) /
                    duration
                );


            const y =
                startY +
                distance *
                ease(progress);


            window.scrollTo(
                0,
                y
            );


            if (
                progress < 1
            ) {

                activeFrame =
                    requestAnimationFrame(
                        step
                    );

            }

            else {

                // 精确定位到整屏顶部
                window.scrollTo(
                    0,
                    targetY
                );


                // 恢复 scroll-snap
                html.style.scrollSnapType =
                    oldSnap;

                html.style.scrollBehavior =
                    oldBehavior;


                activeFrame =
                    null;

                locked =
                    false;


                if (
                    typeof done === "function"
                ) {

                    done();

                }

            }

        }


        activeFrame =
            requestAnimationFrame(
                step
            );

    }



    // =================================================
    // 鼠标滚轮
    // 一滚一整页
    // =================================================

    window.addEventListener(
        "wheel",
        event => {

            if (
                Math.abs(
                    event.deltaY
                ) < 16
            ) {

                return;

            }


            event.preventDefault();


            if (locked) {

                return;

            }


            currentPage =
                getCurrentPage();


            if (
                event.deltaY > 0
            ) {

                animateToPage(
                    currentPage + 1
                );

            }

            else {

                animateToPage(
                    currentPage - 1
                );

            }

        },
        {
            passive: false
        }
    );



    // =================================================
    // 手动拖滚动条
    // =================================================

    window.addEventListener(
        "scroll",
        () => {

            if (!locked) {

                currentPage =
                    getCurrentPage();

            }

        },
        {
            passive: true
        }
    );



    return {

        pages,

        getCurrentPage,

        getPageIndexByHash,

        jumpToPage,

        animateToPage

    };

}



// =====================================================
// 统一处理站内锚点
// =====================================================

function initAnchorNavigation(pager) {

    if (!pager) {

        return;

    }


    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    'a[href^="#"]'
                );


            if (!link) {

                return;

            }


            const hash =
                link.getAttribute(
                    "href"
                );


            if (
                !hash ||
                hash === "#"
            ) {

                return;

            }


            const pageIndex =
                pager.getPageIndexByHash(
                    hash
                );


            if (
                pageIndex === -1
            ) {

                return;

            }


            // ============================
            // 阻止浏览器默认瞬间跳转
            // ============================

            event.preventDefault();


            // 更新地址栏
            // 但不让浏览器自己跳
            history.pushState(
                null,
                "",
                hash
            );


            // ============================
            // 使用我们自己的平滑翻页
            // ============================

            pager.animateToPage(
                pageIndex,
                720,
                () => {

                    // 如果点击的是
                    // 院校合作 / 企业合作
                    // 人才培养 / 产业生态
                    // 到达第二屏后突出对应卡片

                    let target;


                    try {

                        target =
                            document.querySelector(
                                hash
                            );

                    }

                    catch (error) {

                        target =
                            null;

                    }


                    if (
                        target &&
                        target.classList.contains(
                            "industry-card"
                        )
                    ) {

                        target.focus({
                            preventScroll: true
                        });


                        setTimeout(() => {

                            target.blur();

                        }, 900);

                    }

                }
            );

        }
    );



    // =================================================
    // 浏览器前进 / 后退
    // =================================================

    window.addEventListener(
        "popstate",
        () => {

            const hash =
                location.hash ||
                "#home";


            const index =
                pager.getPageIndexByHash(
                    hash
                );


            if (
                index !== -1
            ) {

                pager.animateToPage(
                    index,
                    520
                );

            }

        }
    );

}
