/*
  第1屏 Hero 交互
  ============================
  只控制首页四个提示词、四张卡片及展开效果。
  后面修改产教融合等页面时，不需要改这里。
*/
window.initHero = function initHero(){
    const hero = document.querySelector("#home");
    if(!hero || hero.dataset.heroInitialized === "1") return;

    hero.dataset.heroInitialized = "1";

    const groups = [...hero.querySelectorAll(".card-group")];
    const cards = [...hero.querySelectorAll(".nav-card")];
    const tabs = [...hero.querySelectorAll(".card-tab")];
    const deck = hero.querySelector(".card-deck");

    if(!deck) return;

    function activate(index){
        groups.forEach((group,i)=>{
            group.classList.toggle("active", i === index);
        });

        cards.forEach((card,i)=>{
            card.classList.toggle("active", i === index);
        });

        deck.classList.add("has-active");
    }

    function clearActive(){
        groups.forEach(group=>group.classList.remove("active"));
        cards.forEach(card=>card.classList.remove("active"));
        deck.classList.remove("has-active");
    }

    groups.forEach((group,index)=>{
        group.addEventListener("mouseenter",()=>activate(index));
        group.addEventListener("focusin",()=>activate(index));
    });

    deck.addEventListener("mouseleave",clearActive);

    const targets = ["#industry","#courses","#about","#embodied"];

    tabs.forEach((tab,index)=>{
        tab.addEventListener("click",()=>{
            document.querySelector(targets[index])?.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });
        });
    });
};
