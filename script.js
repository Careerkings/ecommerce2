const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverLay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const checkoutButton = document.querySelector('.checkout-btn');
const checkoutItems = document.querySelector('#checkout-items');
const checkoutTotal = document.querySelector('#checkout-total');
const makePaymentBtn = document.querySelector('.payment-btn');
const navIcon = document.querySelector('.nav-icon')

let cart = [];
let btnsDom = [];


class Products {
    getProducts = async () => {
        try {
            let response = await fetch('product.json');
            let data = await response.json();

            let myProducts = data.items;
            myProducts = myProducts.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });
            return myProducts;
        } catch (error) {
            console.log(error);
        }
    };
}

class UI {
    displayProducts = (myProducts) => {
        let display = '';
        myProducts.forEach(myProduct => {
            display += `
        <article class="product">
        <div class="img-container">
            <img src=${myProduct.image}
             alt="product" 
             class="product-img">
            <button class="bag-btn" data-id=${myProduct.id}>
                 <i class="fas fa-shopping-cart"></i>
                 add to cart
            </button>
        </div>
        <h3>${myProduct.title}</h3>
        <h4>${myProduct.price}</h4>
    </article>`;
        });
        productsDOM.innerHTML = display;
    };

    getBagBtns() {
        const btns = [...document.querySelectorAll('.bag-btn')];
        btnsDom = btns; 
        btns.forEach((btn) => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
            } else {
                btn.addEventListener('click', (e) => {
                    e.target.innerText = 'In Cart';
                    e.target.disabled = true;
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };
                    cart = [...cart, cartItem];
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    this.addCartItem(cartItem); 
                });
            }
        });
    }

    setCartValues = (cart) => {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    };

    addCartItem = (item) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product">
        <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id} >remove</span>
        </div>
        <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
    };

    showCart = () => {
        cartOverLay.classList.add('revealOverlay');
        cartDOM.classList.add('showCart');
    };

    setupApp = () => {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', () => {
            this.showCart();
        });
        closeCartBtn.addEventListener('click', this.hideCart);
        clearCartBtn.addEventListener('click', this.clearCart);
    };

    populateCart = () => {
        cart.forEach(item => this.addCartItem(item));
    };

    hideCart = () => {
        cartOverLay.classList.remove('revealOverlay');
        cartDOM.classList.remove('showCart');
    };

    clearCart = () => {
        cart.forEach(item => {
            const btn = this.getSingleBtn(item.id);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
            }
        });

        cart = [];
        this.setCartValues(cart);
        Storage.saveCart(cart);
        this.displayCartItems(); 
        this.hideCart();
    };

    removeItem = (id) => {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        this.displayCartItems();
    };

    getSingleBtn = (id) => {
        return btnsDom.find(btn => btn.dataset.id === id);
    };

    displayCartItems = () => {
        cartContent.innerHTML = '';
        cart.forEach(item => this.addCartItem(item));
    };

    cartLogic = () => {
        clearCartBtn.addEventListener('click', this.clearCart);

        cartContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const removeItem = e.target;
                const id = removeItem.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            } else if (e.target.classList.contains('fa-chevron-up')) {
                const addAmount = e.target;
                const id = addAmount.dataset.id;
                const tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                this.setCartValues(cart);
                Storage.saveCart(cart);
                this.displayCartItems();
            } else if (e.target.classList.contains('fa-chevron-down')) {
                const lowerAmount = e.target;
                const id = lowerAmount.dataset.id;
                const tempItem = cart.find(item => item.id === id);

                if (tempItem.amount > 1) {
                    tempItem.amount -= 1;
                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    this.displayCartItems();
                }
            }
        });
    };
}

class Storage {
    static saveProducts(myProducts) {
        localStorage.setItem('products', JSON.stringify(myProducts))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    ui.setupApp();

    products.getProducts().then((myProducts) => {
        ui.displayProducts(myProducts);
        Storage.saveProducts(myProducts);
    }).then(() => {
        ui.getBagBtns();
        ui.cartLogic();
    });

    cartBtn.addEventListener('click', () => {
        ui.showCart();
    });

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
   
    
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    cartItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('checkout-item');
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <p>Quantity: ${item.amount}</p>
            </div>`;
        checkoutItems.appendChild(itemDiv);
    });

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.amount, 0);
    checkoutTotal.textContent = totalPrice.toFixed(2);

    makePaymentBtn.addEventListener('click', () => {
        alert('Payment cannot be processed at this time, do bear with us!');
    });
});
const handleIcon = () => {
    alert('scroll down to view our products')
}
navIcon.addEventListener('click', handleIcon)



