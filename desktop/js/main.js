/*
  北京汇博智能实训基地｜电脑端公共逻辑

  功能：
  1. 加载5个独立页面模块
  2. 初始化首页Hero交互
  3. 一滚一页翻页
  4. 修复刷新后自动跳到基地概况的问题
*/


// =====================================================
// 刷新定位修复
// =====================================================

// 禁止浏览器记忆刷新前滚动位置
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}


// 刷新时清除锚点，并回到第一页
function resetHomePosition(){

    // 如果地址栏有 #about / #courses 等
    // 清除它
    if(location.hash){

        history.replaceState(
            null,
            "",
            location.pathname + location.search
        );

    }


    // 回到顶部
    window.scrollTo({
        top:0,
        left:0,
        behavior:"auto"
    });

}


// 页面开始加载立即执行
resetHomePosition();



document.addEventListener(
"DOMContentLoaded",
async()=>{


    const content =
        document.getElementById("site-content");


    // 五个独立模块
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



        // 插入页面

        content.innerHTML =
        htmlList.join("\n");



        // 初始化第一页卡片交互

        if(
            typeof window.initHero === "function"
        ){

            window.initHero();

        }




        // ===========================
        // 重点修复
        // 模块加载完成后再次回首页
        // ===========================


        window.scrollTo({

            top:0,

            left:0,

            behavior:"auto"

        });



        // 等浏览器布局完成后再次确认

        requestAnimationFrame(()=>{


            requestAnimationFrame(()=>{


                window.scrollTo({

                    top:0,

                    left:0,

                    behavior:"auto"

                });



                initFullPageScroll();


            });


        });



        // 最后一层保险

        setTimeout(()=>{


            window.scrollTo({

                top:0,

                left:0,

                behavior:"auto"

            });


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
