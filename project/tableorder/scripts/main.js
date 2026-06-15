function getTempImage(baseImg, temp){
    const name = baseImg.split(".")[0];
    const ext = baseImg.split(".")[1];

    if(temp == "ICE") {
        return name + "_ice." + ext;
    }

    if(temp == "HOT") {
        return name + "_hot." + ext;
    }

    return baseImg;
}

const mainTabArea = document.querySelector(".tab-main");
const mainTabBtn = mainTabArea.querySelectorAll("li");
const categoryTitle = document.querySelector("#selected-category-name");
const orderSec = document.querySelector("#orderSec");
const orderList = document.querySelector("#order-list");
const orderTotal = document.querySelector("#order-total-price");
const btnOrder = document.querySelector("#btn-order");
const btnCloseOrder = document.querySelector("#btn-close-order");
const btnViewOrder = document.querySelector("#btn-view-order");
const orderMsg = document.querySelector(".order-msg");

const cartSidebar = document.querySelector("#cartSec");
const btnViewCart = document.querySelector("#btn-view-cart");
const btnCloseCart = document.querySelector("#btn-close-cart");
const cartListArea = document.querySelector("#cart-list");
const footerTotalEl = document.querySelector("#cart-total-price");

const confirmSec = document.querySelector("#confirmSec");
const btnConfirmOrder = document.querySelector("#btn-confirm-order");
const btnCancelOrder = document.querySelector("#btn-cancel-order");

let choiceProduct = null;
const cartArr = [];
const orderArr = [];
let orderInterval = null; // 주문완료 카운트다운 타이머를 전역으로 관리

function openCartSidebar() {
    if (cartSidebar) {
        cartSidebar.classList.add("show");
    }
}

if (btnViewCart) {
    btnViewCart.addEventListener("click", function() {
        openCartSidebar();
    });
}

if (btnCloseCart) {
    btnCloseCart.addEventListener("click", function() {
        cartSidebar.classList.remove("show");
    });
}

function renderCartList() {
    let html = "";
    let finalTotalPrice = 0;

    cartArr.forEach(function(item, index) {
        const itemTotalPrice = (item.price + item.extraPrice) * item.qty;
        finalTotalPrice += itemTotalPrice;

        let minusDisabled = "";
        if (item.qty <= 1) {
            minusDisabled = "disabled";
        }

        let plusDisabled = "";
        if (item.qty >= 5) {
            plusDisabled = "disabled";
        }

        let optionText = "";
        if (item.option) {
            let optArr = [];

            for (let key in item.option) {
                let val = item.option[key];
                let addPrice = 0;

                if (optionPrice[key] && optionPrice[key][val]) {
                    addPrice = optionPrice[key][val];
                }

                let displayVal = val;

                if (val == "HOT") {
                    displayVal = '<span style="color:#e94b4b;">핫</span>';
                } else if (val == "ICE" || val == "ONLY ICE") {
                    displayVal = '<span style="color:#3b82f6;">아이스</span>';
                }

                let optStr = displayVal;

                if (addPrice > 0) {
                    optStr += "+" + addPrice + "원";
                }

                optArr.push(optStr);
            }

            if (optArr.length > 0) {
                optionText = "· " + optArr.join(" · ");
            }
        }

        html += `
        <li class="cart-item" data-index="${index}">
            <div class="cart-item-top">
                <div class="cart-item-img">
                    <img src="images/${item.category}/${item.img}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${itemTotalPrice.toLocaleString()}원</div>
                </div>
            </div>
            <div class="cart-item-options">${optionText}</div>
            <div class="cart-item-controls">
                <div class="cart-qty">
                    <button class="cart-minus" ${minusDisabled}>-</button>
                    <span class="cart-count">${item.qty}</span>
                    <button class="cart-plus" ${plusDisabled}>+</button>
                </div>
                <button class="cart-delete">삭제</button>
            </div>
        </li>`;
    });

    cartListArea.innerHTML = html;
    footerTotalEl.textContent = finalTotalPrice.toLocaleString() + "원";

    if (cartArr.length === 0) {
        cartSidebar.classList.remove("show");
    }
}

cartListArea.addEventListener("click", function(e) {
    if (e.target.tagName !== "BUTTON") return;

    const li = e.target.closest(".cart-item");
    if (!li) return;

    const index = Number(li.dataset.index);

    if (e.target.classList.contains("cart-minus") && cartArr[index].qty > 1) {
        cartArr[index].qty--;
        renderCartList();
    }

    if (e.target.classList.contains("cart-plus") && cartArr[index].qty < 5) {
        cartArr[index].qty++;
        renderCartList();
    }

    if (e.target.classList.contains("cart-delete")) {
        cartArr.splice(index, 1);
        renderCartList();
    }
});

mainTabBtn.forEach(function(btn){
    btn.addEventListener("click", function(){
        const mainName = this.dataset.main;

        mainTabBtn.forEach(function(b){
            b.classList.remove("main-on");
        });

        this.classList.add("main-on");

        if(categoryTitle) {
            categoryTitle.textContent = this.querySelector("button").textContent;
        }

        renderProductList(makeFinalCategory(mainName));

        if (cartSidebar) {
            cartSidebar.classList.remove("show");
        }
    });
});

function makeFinalCategory(mainName){
    if(mainName == "best") {
        return [...menu].slice(0, 8);
    }

    return menu.filter(function(item){
        if(mainName == "new") {
            if (item.isNew == true) {
                return true;
            } else {
                return false;
            }
        }

        if (item.category == mainName) {
            return true;
        } else {
            return false;
        }
    });
}

const productArea = document.querySelector(".product-list");

function renderProductList(productArr){
    let html = "";

    productArr.forEach(function(item){
        let newBadge = "";

        if (item.isNew) {
            newBadge = `<span class="badge-new">NEW</span>`;
        }

        html += `
            <li class="item" data-id="${item.id}">
                <div class="item-img">
                    ${newBadge}
                    <img src="images/${item.category}/${item.img}" alt="${item.menuName}">
                </div>
                <div class="item-name">${item.menuName}</div>
                <div class="item-price">${item.price.toLocaleString()}원</div>
            </li>`;
    });

    productArea.innerHTML = html;
    productArea.scrollTop = 0;
}

productArea.addEventListener("click", function(e){
    const li = e.target.closest("li");
    if(!li) return;

    choiceProduct = menu.find(function(item){
        if (li.dataset.id == item.id) {
            return true;
        } else {
            return false;
        }
    });

    if(!choiceProduct.option){
        const existItem = cartArr.find(function(item){
            if (item.id == choiceProduct.id) {
                return true;
            } else {
                return false;
            }
        });

        if(existItem){
            alert("선택한 상품은 이미 장바구니에 있어요.");
            return;
        }

        cartArr.push({
            id: choiceProduct.id,
            name: choiceProduct.menuName,
            price: choiceProduct.price,
            qty: 1,
            extraPrice: 0,
            option: null,
            img: choiceProduct.img,
            category: choiceProduct.category
        });

        renderCartList();
        openCartSidebar();
        return;
    }

    renderProductOption();
});

const optionName = {
    tumbler: "컵 선택",
    size: "사이즈",
    temp: "온도",
    been: "원두 선택",
    shot: "샷 농도",
    sweet: "당도",
    iceB: "얼음량"
};

const optionPrice = {
    size: { "라지": 0, "점보": 1000 },
    been: { "기본": 0, "다크": 500, "디카페인": 800 },
    shot: { "기본": 0, "연하게": 0, "진하게": 500 }
};

const optionSec  = document.querySelector("#optionSec");
const optionList = optionSec.querySelector(".option-list");
const total_El   = document.querySelector("#optionSec .price .total");

function renderProductOption(){
    if(!choiceProduct.option) return;

    const productInfo = optionSec.querySelector(".product-info");
    optionSec.classList.add("show");

    productInfo.innerHTML = `
        <img src="images/${choiceProduct.category}/${choiceProduct.img}" alt="${choiceProduct.menuName}">
        <p>${choiceProduct.menuName}</p>
        <p>${choiceProduct.price}원</p>
    `;

    let optionHtml = "";

    for(let key in choiceProduct.option){
        optionHtml += `<dl class="option-group style1"><dt>${optionName[key]}</dt><dd>`;

        choiceProduct.option[key].forEach(function(value, inx){
            let activeClass = "";

            if (inx == 0) {
                activeClass = "active";
            }

            let priceTxt = "";

            if (optionPrice[key] && optionPrice[key][value]) {
                priceTxt = `<span class="price-badge">+${optionPrice[key][value]}원</span>`;
            }

            optionHtml += `<button class="option-btn ${activeClass}" data-key="${key}" data-value="${value}">${value}${priceTxt}</button>`;
        });

        optionHtml += `</dd></dl>`;
    }

    optionList.innerHTML = optionHtml;

    if(total_El) {
        total_El.textContent = choiceProduct.price.toLocaleString();
    }

    optionList.scrollTop = 0;
}

optionList.addEventListener("click", function(e){
    const clickBtn = e.target.closest("button");
    if(!clickBtn) return;

    clickBtn.parentElement.querySelectorAll("button").forEach(function(btn){
        btn.classList.remove("active");
    });

    clickBtn.classList.add("active");

    if(choiceProduct.menuName == "아메리카노" && clickBtn.dataset.key == "temp"){
        optionSec.querySelector(".product-info img").src = `images/${choiceProduct.category}/${getTempImage(choiceProduct.img, clickBtn.dataset.value)}`;
    }

    updateOptionTotalPrice();
});

function updateOptionPrice(){
    const selectedBtn = document.querySelectorAll(".option-list dd button.active");
    let extraPrice = 0;
    const selectedOptions = {};

    selectedBtn.forEach(function(btn){
        const key = btn.dataset.key;
        const value = btn.dataset.value;

        if(value == "기본" || value == "매장용" || value == "보통") {
            return;
        }

        selectedOptions[key] = value;

        if(optionPrice[key] && optionPrice[key][value]) {
            extraPrice += optionPrice[key][value];
        }
    });

    return { extraPrice, selectedOptions };
}

const optionQtyArea = document.querySelector("#optionSec .quantity");
let count_El = null;
let minusBtn = null;
let plusBtn = null;

if (optionQtyArea) {
    count_El = optionQtyArea.querySelector(".count");
    minusBtn = optionQtyArea.querySelector(".minus");
    plusBtn  = optionQtyArea.querySelector(".plus");
}

const optionCloseBtn = optionSec.querySelector("#btn-close-modal");
const cartAddBtn     = optionSec.querySelector(".price");

if(minusBtn) {
    minusBtn.disabled = true;
}

if(optionQtyArea){
    optionQtyArea.addEventListener("click", function(e){
        if(e.target.tagName != "BUTTON") return;

        let qty = Number(count_El.textContent);

        if(e.target.dataset.btn == "minus" && qty > 1) {
            qty--;
        }

        if(e.target.dataset.btn == "plus" && qty < 5) {
            qty++;
        }

        count_El.textContent = qty;
        updateOptionTotalPrice();

        if(minusBtn) {
            if (qty <= 1) {
                minusBtn.disabled = true;
            } else {
                minusBtn.disabled = false;
            }
        }

        if(plusBtn) {
            if (qty >= 5) {
                plusBtn.disabled = true;
            } else {
                plusBtn.disabled = false;
            }
        }
    });
}

function updateOptionTotalPrice(){
    const result = updateOptionPrice();
    const extraPrice = result.extraPrice;

    let qty = 1;
    if (count_El) {
        qty = Number(count_El.textContent);
    }

    if(total_El) {
        total_El.textContent = ((choiceProduct.price + extraPrice) * qty).toLocaleString();
    }
}

if(optionCloseBtn){
    optionCloseBtn.addEventListener("click", function(){
        if(count_El) {
            count_El.textContent = 1;
        }

        if(minusBtn) {
            minusBtn.disabled = true;
        }

        if(plusBtn) {
            plusBtn.disabled = false;
        }

        optionSec.classList.remove("show");
    });
}

if(cartAddBtn){
    cartAddBtn.addEventListener("click", function(){
        const result = updateOptionPrice();
        const extraPrice = result.extraPrice;
        const selectedOptions = result.selectedOptions;

        let qty = 1;
        if (count_El) {
            qty = Number(count_El.textContent);
        }

        const existItem = cartArr.find(function(item){
            if(item.id != choiceProduct.id || !item.option) {
                return false;
            }

            for(let key in selectedOptions){
                if(item.option[key] != selectedOptions[key]) {
                    return false;
                }
            }

            return true;
        });

        if(existItem){
            alert("같은 상품+옵션이 장바구니에 이미 있습니다.");
            return;
        }

        let selectedImg = choiceProduct.img;
        if(choiceProduct.menuName == "아메리카노" && selectedOptions.temp) {
            selectedImg = getTempImage(choiceProduct.img, selectedOptions.temp);
        }

        cartArr.push({
            id: choiceProduct.id,
            name: choiceProduct.menuName,
            price: choiceProduct.price,
            qty: qty,
            extraPrice: extraPrice,
            option: selectedOptions,
            img: selectedImg,
            category: choiceProduct.category
        });

        renderCartList();

        if(optionCloseBtn) {
            optionCloseBtn.click();
        }

        openCartSidebar();
    });
}

btnOrder.addEventListener("click", function(){
    if(cartArr.length == 0){
        alert("장바구니가 비어있습니다.");
        return;
    }

    confirmSec.classList.add("show");
});

if(btnCancelOrder){
    btnCancelOrder.addEventListener("click", function(){
        confirmSec.classList.remove("show");
    });
}

if(btnConfirmOrder){
    btnConfirmOrder.addEventListener("click", function(){
        confirmSec.classList.remove("show");

        orderArr.length = 0;
        orderArr.push(...cartArr);

        let html = "";
        let total = 0;

        cartArr.forEach(function(item){
            const price = (item.price + item.extraPrice) * item.qty;
            total += price;
            html += `<li><span class="name">${item.name}x${item.qty}</span><span class="price">${price.toLocaleString()}원</span></li>`;
        });

        orderList.innerHTML = html;
        orderTotal.textContent = total.toLocaleString() + "원";

        if(orderInterval) {
            clearInterval(orderInterval);
            orderInterval = null;
        }

        let countdown = 5;

        if(orderMsg) {
            orderMsg.innerHTML = `주문이 완료되었습니다. <span class="countdown">(${countdown}초 후 닫힘)</span>`;
        }

        orderInterval = setInterval(function(){
            countdown--;

            if(countdown > 0 && orderMsg) {
                orderMsg.innerHTML = `주문이 완료되었습니다. <span class="countdown">(${countdown}초 후 닫힘)</span>`;
            }
        }, 1000);

        orderSec.classList.add("show");

        setTimeout(function(){
            orderSec.classList.remove("show");
            clearInterval(orderInterval);
            orderInterval = null;
        }, 5000);

        cartArr.length = 0;
        renderCartList();
        cartSidebar.classList.remove("show");
    });
}

if(btnCloseOrder){
    btnCloseOrder.addEventListener("click", function(){
        if(orderInterval) {
            clearInterval(orderInterval);
            orderInterval = null;
        }

        orderSec.classList.remove("show");
    });
}

if(btnViewOrder){
    btnViewOrder.addEventListener("click", function(){
        if(orderInterval) {
            clearInterval(orderInterval);
            orderInterval = null;
        }

        if(orderArr.length == 0){
            orderList.innerHTML = `<li class="empty">주문내역이 없습니다.</li>`;
            orderTotal.textContent = "0원";

            if(orderMsg) {
                orderMsg.textContent = "주문내역 없음";
            }
        } else {
            let html = "";
            let total = 0;

            orderArr.forEach(function(item){
                const price = (item.price + item.extraPrice) * item.qty;
                total += price;
                html += `<li><span class="name">${item.name}x${item.qty}</span><span class="price">${price.toLocaleString()}원</span></li>`;
            });

            orderList.innerHTML = html;
            orderTotal.textContent = total.toLocaleString() + "원";

            if(orderMsg) {
                orderMsg.textContent = "주문 내역";
            }
        }

        orderSec.classList.add("show");

        if(cartSidebar) {
            cartSidebar.classList.remove("show");
        }
    });
}

mainTabBtn[0].click();