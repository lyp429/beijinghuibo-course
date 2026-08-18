/*
  全站公共逻辑
  =========================================================
  1. 组装 5 个独立 HTML 模块
  2. 初始化第1屏交互
  3. 维持 V5 的“一滚一页”精准吸附
*/

document.addEventListener("DOMContentLoaded", async () => {
    const content = document.getElementById("site-content");

    const modules = [
        "./sections/hero.html",
        "./sections/industry.html",
        "./sections/courses.html",
        "./sections/about.html",
        "./sections/embodied.html"
    ];

    try{
        const htmlList = await Promise.all(
            modules.map(async file => {
                const response = await fetch(file, {cache:"no-store"});

                if(!response.ok){
                    throw new Error(`${file} 加载失败：${response.status}`);
                }

                return await response.text();
            })
        );

        content.innerHTML = htmlList.join("\n");

        /* 第一屏四卡片交互 */
        if(typeof window.initHero === "function"){
            window.initHero();
        }

        /* 5 屏全部载入后，再启动整页滚动 */
        initFullPageScroll();

        /* 如果 URL 自带 #industry / #courses 等锚点，加载后再定位 */
        if(location.hash){
            requestAnimationFrame(()=>{
                document.querySelector(location.hash)?.scrollIntoView({
                    behavior:"auto",
                    block:"start"
                });
            });
        }

    }catch(error){
        console.error(error);

        content.innerHTML = `
            <div class="site-load-error">
                <h2>页面模块加载失败</h2>
                <p>${error.message}</p>
                <p>
                    如果你是直接双击本地 HTML 打开的，这是浏览器对 fetch 的限制。
                    上传到 GitHub Pages 后即可正常加载。
                </p>
            </div>
        `;
    }
});


function initFullPageScroll(){
    const pages = [
        ...document.querySelectorAll(".hero, .home-section")
    ];

    if(!pages.length) return;

    let locked = false;
    let currentPage = 0;
    let unlockTimer = null;

    function getClosestPage(){
        const y = window.scrollY;
        let bestIndex = 0;
        let bestDistance = Infinity;

        pages.forEach((page,index)=>{
            const distance = Math.abs(page.offsetTop - y);

            if(distance < bestDistance){
                bestDistance = distance;
                bestIndex = index;
            }
        });

        return bestIndex;
    }

    function goToPage(index){
        currentPage = Math.max(
            0,
            Math.min(index, pages.length - 1)
        );

        window.scrollTo({
            top: pages[currentPage].offsetTop,
            behavior:"smooth"
        });

        clearTimeout(unlockTimer);

        unlockTimer = setTimeout(()=>{
            window.scrollTo({
                top: pages[currentPage].offsetTop,
                behavior:"auto"
            });

            locked = false;
        },760);
    }

    window.addEventListener(
        "wheel",
        function(event){
            if(Math.abs(event.deltaY) < 16) return;

            event.preventDefault();

            if(locked) return;

            locked = true;
            currentPage = getClosestPage();

            if(event.deltaY > 0){
                goToPage(currentPage + 1);
            }else{
                goToPage(currentPage - 1);
            }
        },
        {passive:false}
    );

    window.addEventListener(
        "scroll",
        function(){
            if(!locked){
                currentPage = getClosestPage();
            }
        },
        {passive:true}
    );
}
