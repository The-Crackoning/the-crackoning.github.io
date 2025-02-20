/**Funky things to note about scrollToNextCards()
 * - It scrolls further than it should: it scroll margin-left + padding-left + width + padding-right + margin-right
 * - This means that it will always scroll a little further, because we scroll the margin twice instead of once.
 */
function scrollToNextCards(scrollable, container, backwards, child_offset) {
    if (backwards === true) {
        backwards = -1;
    } else {
        backwards = 1;
    }
    // set child_offset
    child_offset = typeof child_offset !== "undefined" ? child_offset : 0;
    let child_offset_negative = child_offset < 0 ? "last-" : "";
    child_offset = child_offset < 0 ? -child_offset : child_offset;
    // the rest
    let parent = container.getBoundingClientRect().left;
    let card1 = container.querySelector(`:nth-${child_offset_negative}child(${1 + child_offset})`).getBoundingClientRect().left;
    let card2 = container.querySelector(`:nth-${child_offset_negative}child(${2 + child_offset})`).getBoundingClientRect().left;
    if (2 + child_offset > container.children.length) {
        card2 = container.querySelector(`:nth-${child_offset_negative}child(${1 + child_offset})`).getBoundingClientRect().right;
    }
    let cardDistance = card2 - card1;
    let cardToEdge = card1 - parent;
    let scrolledDistance = (cardDistance + cardToEdge) * backwards;
    // scrollToNextCardsUpdateArrows(scrollable, scrolledDistance);
    scrollable.scrollBy({
        left: scrolledDistance,
        behavior: "smooth"}
    );
    // console.log([cardDistance, cardToEdge, parent, card1, card2, child_offset, child_offset_negative]);
}
function scrollToNextCardsUpdateArrows(scrollable/*, scrolledDistance*/) {
    // let postScrollLeft = scrollable.scrollLeft + (scrolledDistance ?? 0); // if it ain't defined, just use the current scroll
    let postScrollLeft = scrollable.scrollLeft;
    let maxScrollLeft = scrollable.scrollWidth - scrollable.clientWidth;
    if (postScrollLeft < 0) {
        postScrollLeft = 0;
    }
    if (postScrollLeft > maxScrollLeft) {
        postScrollLeft = maxScrollLeft;
    }
    if (postScrollLeft === maxScrollLeft) {
        scrollable.parentElement.setAttribute("data-maxscroll", "");
    } else {
        scrollable.parentElement.removeAttribute("data-maxscroll");
    }
    if (postScrollLeft === 0) {
        scrollable.parentElement.setAttribute("data-noscroll", "");
    } else {
        scrollable.parentElement.removeAttribute("data-noscroll");
    }
    // console.log([scrollable.scrollLeft, maxScrollLeft, scrolledDistance, postScrollLeft]);
}
function scrollToNextCards_init(scrollable, buttons_parent, container, child_offset) {
    /* to more easily initialize the scrollToNextCards commands and streamline the process a little bit more I have created this */
    /* you may ommit "container" */
    if (container === undefined) {
        container = scrollable;
    };
    // make buttons work
    buttons_parent.querySelector(":first-child").addEventListener("click", ()=>{
        scrollToNextCards(scrollable, container, true, child_offset);
    });
    buttons_parent.querySelector(":last-child").addEventListener("click", ()=>{
        scrollToNextCards(scrollable, container, false, child_offset);
    });
    // make buttons dissappear
    scrollable.addEventListener("scrollend", ()=>{
        scrollToNextCardsUpdateArrows(scrollable);
    });
    scrollable.addEventListener("scroll", ()=>{
        scrollToNextCardsUpdateArrows(scrollable);
    });
    window.visualViewport.addEventListener("resize", ()=>{
        scrollToNextCardsUpdateArrows(scrollable);
    });
    // make buttons dissappear after initialization
    scrollToNextCardsUpdateArrows(scrollable);
}

// Scrolling for horizontal overflowing elements
let dragToScrollActive = false;
let dragToScrollElm = undefined;
function dragToScroll_grabNearestParent(elm) {
    if (!elm.classList.contains("overflow")) {
        if (elm.parentElement) {
            return dragToScroll_grabNearestParent(elm.parentElement);
        } else {
            return undefined;
        }
    } else {
        return elm;
    }
}
function dragToScrollInit(e) {
    if (e.button != 0) {
        return;
    }
    dragToScrollElm = dragToScroll_grabNearestParent(e.target);
    if (dragToScrollElm && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        dragToScrollActive = true;
    }
}
function dragToScrollMove(e) {
    if (dragToScrollActive == true) {
        e.preventDefault()
        dragToScrollElm.scrollBy({left: -e.movementX, top: -e.movementY, behavior: "instant"})
    }
}
function dragToScrollEnd(e) {
    dragToScrollActive = false;
    dragToScrollElm = undefined;
}
window.addEventListener("mousedown", dragToScrollInit);
window.addEventListener("mousemove", dragToScrollMove);
// window.addEventListener("mouseleave", dragToScrollEnd);
// window.addEventListener("mouseout", dragToScrollEnd);
window.addEventListener("mouseup", dragToScrollEnd);

// Disable scrolling
let allowScrolling = true;
function toggleAllowScrolling(changeto=undefined) {
    allowScrolling = Boolean(changeto) ?? allowScrolling;
}
function shouldWePreventScrolling(e) {
    if (!allowScrolling) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}
window.addEventListener("wheel", shouldWePreventScrolling, {passive: false});
window.addEventListener("touchmove", shouldWePreventScrolling, {passive: false});

// Language
// https://flagicons.lipis.dev/
var lang = {
    available: ["english", "german"],
    langconfig: {
        "english": {
            code: "gb"
        },
        "german": {
            code: "de"
        }
    },
    priority: { /* It goes from front to back */
        "english": [],
        "german": ["english"]
    },
    default: "english",
    selected: localStorage.getItem("lang") ?? "english",
    initialized: false,
    find: function(stringcode, forlang=undefined) {
        const langcode = stringcode.split(".");
        let langcoderef = langtext[forlang ?? lang.selected];
        // console.log(langcoderef);
        for (let i = 0; i < langcode.length; i++) {
            const code = langcode[i];
            if (langcoderef[code]) {
                langcoderef = langcoderef[code];
            } else {
                return undefined;
            }
        }
        return langcoderef;
    },
    init: function() {
        if (!langtext[lang.default]) langtext[lang.default] = {};
        document.querySelectorAll(".text").forEach(item => {
            const langcode = item.getAttribute("data-lang").split(".");
            let langcoderef = langtext[lang.default]; // I hope this stays a reference
            for (let i = 0; i < langcode.length-1; i++) {
                const code = langcode[i];
                if (!langcoderef[code]) {
                    langcoderef[code] = {};
                };
                langcoderef = langcoderef[code];
            };
            langcoderef[langcode[langcode.length-1]] = item.innerHTML;
        });
        lang.changeLang(lang.selected);
    },
    changeLang: function(sellang) {
        if (!lang.available.includes(sellang)) {
            throw SyntaxError("Language doesn't exist.");
        }
        localStorage.setItem("lang", sellang);
        lang.selected = sellang;
        function trylang(elm, sellang) {
            const newtext = lang.find(elm.getAttribute("data-lang"), sellang);
            if (newtext) {
                elm.innerHTML = newtext;
                return true;
            } else {
                return false;
            }
        }
        document.querySelectorAll(".text").forEach(item => {
            const testlangs = Array(sellang, lang.priority[sellang]);
            for (let i = 0; i < testlangs.length; i++) {
                const trythislang = testlangs[i];
                if (trylang(item, trythislang)) {
                    break;
                }
            }
        });
        lang.initialized = true;
    },
    openui: function(event=undefined) {
        if (document.getElementById("languageui") || !lang.initialized) return;
        let isKeypress = false;
        if (event) if (event.type == "keypress") isKeypress = true;
        // Parent
        const langui = document.createElement("div");
        langui.id = "languageui";
        langui.classList.add("column", "gaps");
        langui.onpointerdown = (e) => {if (e.target === langui) langui.setAttribute("downonme", "")};
        langui.onpointerup = (e) => {if (e.target === langui && langui.getAttribute("downonme") === "") lang.closeui(); langui.removeAttribute("downonme");};
        langui.addEventListener("keydown", (e) => {if (e.key === "Escape") lang.closeui();});
        // Title & Test
        const langtitle = document.createElement("h1");
        langtitle.innerHTML = lang.find("languageui.select");
        const langinfo = document.createElement("p");
        langinfo.innerHTML = lang.find("languageui.info");
        // Buttons
        const langcontainer = document.createElement("div");
        langcontainer.classList.add("dyn-row", "wrap", "gaps", "centerAll", "lang-icons");
        lang.available.forEach(item => {
            const langbox = document.createElement("a");
            langbox.classList.add("fi", "fis", "fi-" + lang.langconfig[item].code);
            if (item == lang.selected) langbox.classList.add("selected");
            const thefunc = ()=>{lang.changeLang(item); lang.closeui();};
            langbox.addEventListener("click", thefunc);
            langbox.addEventListener("keypress", thefunc);
            langbox.tabIndex = "0";
            langcontainer.append(langbox);
        });
        // Focusing
        langcontainer.firstElementChild.addEventListener("focusout", (e) => {
            if (e.relatedTarget !== langcontainer.firstElementChild.nextElementSibling && e.relatedTarget !== null) langcontainer.lastChild.focus({focusVisible: true});
        });
        langcontainer.lastElementChild.addEventListener("focusout", (e) => {
            if (e.relatedTarget !== langcontainer.lastElementChild.previousElementSibling && e.relatedTarget !== null) langcontainer.firstChild.focus({focusVisible: true});
        });
        // Fake Focus so it actually doesn't go offscreen
        const langfakefocusbefore = document.createElement("div");
        langfakefocusbefore.tabIndex = "0";
        const langfakefocusafter = document.createElement("div");
        langfakefocusafter.tabIndex = "0";
        // Appending
        langui.append(langtitle, langinfo, langfakefocusbefore, langcontainer, langfakefocusafter);
        document.body.append(langui);
        toggleAllowScrolling(false);
        // Focus
        langcontainer.firstElementChild.focus({focusVisible: isKeypress});
    },
    closeui: function() {
        document.getElementById("languageui").classList.add("fade-out");
        toggleAllowScrolling(true);
        setTimeout(() => {
            document.getElementById("languageui").remove();
        }, 300);
    },
}

// Some stuff onload
window.addEventListener("load", function(){
    document.querySelector("html").setAttribute("scripting-enabled", "")
    lang.init();
    // I fucking give up trying to make things clean
    document.querySelectorAll("a").forEach(item => item.setAttribute("draggable", "false"));
    document.querySelectorAll(".gallery").forEach(item => new Viewer(item, {
        inline: false,
        transition: false
    }))
});