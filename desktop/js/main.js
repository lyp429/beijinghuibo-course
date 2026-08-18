/*
  北京汇博智能实训基地｜电脑端公共逻辑

  功能：
  1. 加载5个独立页面模块
  2. 初始化首页Hero交互
  3. 一滚一页翻页
  4. 刷新时仍回到首页
  5. 支持从子页面通过 index.html#industry 返回指定篇幅
*/


// =====================================================
// 初始定位
// =====================================================

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}


// 判断这一次进入网站是不是“刷新”
const navigationEntry =
    performance.getEntriesByType("navigation")[0];

const isReloadNavigation =
    navigationEntry &&
    navigationEntry.type === "reload";


// 记录用户进入网站时原本携带的锚点
// 例如：index.html#industry
const requestedHash = location.hash;


// 只有“刷新”时才清除锚点并强制回首页。
// 正常从子页面返回 index.html#industry 时，不清除锚点。
function prepareInitialPosition(){

    if(isReloadNavigation){

        if(location.hash){

            history.replaceState(
                null,
                "",
                location.pathname + location.search
            );

        }

        window.scrollTo({
            top:0,
            left:0,
            behavior:"auto"
        });

    }

}

prepareInitialPosition();



document.addEventListener(
"DOMContentLoaded",
async()=>{


    const content =
        document.getElementById("site-content");


    const modules=[

        "./sections/hero.html",

        "./sections/industry.html",

        "./sections/courses.html",

        "./sections/about.html",

        "./sections/embodied.html"

    ];



    try{


        // 加载5个页面
        const htmlList =
        await Promise.all(

            modules.map(
                async file=>{

                    const response =
                    await fetch(
                        file,
                        {
                            cache:"no-store"
                        }
                    );


                    if(!response.ok){

                        throw new Error(
                            file+"加载失败"
                        );

                    }


                    return await response.text();

                }
            )

        );



        // 插入5个模块
        content.innerHTML =
        htmlList.join("\n");



        // 初始化第一页交互
        if(
            typeof window.initHero === "function"
        ){

            window.initHero();

        }



        // =================================================
        // 模块全部加载后决定应该停在哪一屏
        // =================================================

        function positionAfterModulesLoaded(){

            // 刷新：仍然回首页
            if(isReloadNavigation){

                window.scrollTo({
                    top:0,
                    left:0,
                    behavior:"auto"
                });

                return;

            }


            // 正常通过 #industry / #courses 等进入：
            // 加载完模块后定位到对应页面
            if(requestedHash){

                const target =
                    document.querySelector(requestedHash);

                if(target){

                    window.scrollTo({
                        top:target.offsetTop,
                        left:0,
                        behavior:"auto"
                    });

                    return;

                }

            }


            // 普通进入网站：第一页
            window.scrollTo({
                top:0,
                left:0,
                behavior:"auto"
            });

        }



        requestAnimationFrame(()=>{

            requestAnimationFrame(()=>{

                positionAfterModulesLoaded();

                initFullPageScroll();

            });

        });



        // 最后一层保险，但不再无条件强制回首页
        setTimeout(()=>{

            positionAfterModulesLoaded();

        },300);



    }

    catch(error){


        console.error(error);


        content.innerHTML = `

        <div class="site-load-error">

            页面加载失败：

            ${error.message}

        </div>

        `;


    }


});





// =====================================================
// 整页翻页功能
// =====================================================


function initFullPageScroll(){


    const pages=[

        ...document.querySelectorAll(
            ".hero,.home-section"
        )

    ];



    if(!pages.length){

        return;

    }



    let locked=false;


    let currentPage=0;


    let timer=null;




    // 找当前所在页
    function getCurrentPage(){


        const y =
        window.scrollY;


        let index=0;


        let distance=
        Infinity;



        pages.forEach(
            (page,i)=>{


                const d=
                Math.abs(
                    page.offsetTop-y
                );



                if(d<distance){

                    distance=d;

                    index=i;

                }


            }
        );



        return index;


    }





    // 跳转页面
    function goPage(index){



        currentPage =
        Math.max(
            0,
            Math.min(
                index,
                pages.length-1
            )
        );



        window.scrollTo({

            top:
            pages[currentPage].offsetTop,

            behavior:"smooth"

        });



        clearTimeout(timer);



        timer =
        setTimeout(()=>{


            window.scrollTo({

                top:
                pages[currentPage].offsetTop,

                behavior:"auto"

            });



            locked=false;



        },800);



    }





    // 鼠标滚轮控制
    window.addEventListener(

        "wheel",

        function(event){



            if(
                Math.abs(event.deltaY)<16
            ){

                return;

            }



            event.preventDefault();



            if(locked){

                return;

            }



            locked=true;



            currentPage =
            getCurrentPage();



            if(event.deltaY>0){


                goPage(
                    currentPage+1
                );


            }

            else{


                goPage(
                    currentPage-1
                );


            }



        },

        {
            passive:false
        }

    );





    // 手动拖动滚动条时同步页码
    window.addEventListener(

        "scroll",

        ()=>{


            if(!locked){

                currentPage =
                getCurrentPage();

            }


        },

        {
            passive:true
        }

    );


}
