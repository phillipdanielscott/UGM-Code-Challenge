document.addEventListener("DOMContentLoaded", () => {
    const quantityBtns = document.querySelectorAll('.quantity__button');

    quantityBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            let actionID = e.currentTarget.id;
            let quantity = e.currentTarget.parentNode.querySelector('.quantity__input').value;
            let lineItem = e.currentTarget.parentNode.querySelector('.quantity__input').dataset.index;
            document.getElementById(`CartItem-${lineItem}`).classList.toggle('loading');
            updateQuantity(e.currentTarget, lineItem, quantity, actionID);
        })
    });

    function grabCart() {
        fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          console.log(sourceQty)
          html.querySelector('.cart-container').innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }

    // On Plus change update cart
    function updateQuantity(target, line, quantity, actionID) {
        let cartErrorMessage = document.getElementById(`Line-item-error-${line}`);
        let newQuantity = actionID === 'plus' ? parseInt(quantity) + 1 : parseInt(quantity) - 1;
        let erorrText = cartErrorMessage.querySelector('.cart-item__error-text');
        let url = `/cart/change.js?line=${line}&quantity=${newQuantity}`
        fetch(url)
            .then(response => response.json())
            .then(data => {
              if(data.status == 422) {
                errorMessage(erorrText, data.message);
                document.getElementById(`CartItem-${line}`).classList.toggle('loading');
              } else {
                console.log(data)
                let newTotal = parseFloat(data.items_subtotal_price / 100.00).toFixed(2);
                document.querySelector('.checkout-btn').textContent = 'Checkout — $' + newTotal + ' ' + data.currency;
                document.getElementById(`CartItem-${line}`).classList.toggle('loading');
                target.parentNode.querySelector('.quantity__input').value = newQuantity;
                grabCart();
              }
            })
            .catch(error => {
              // Handle any errors
              console.error(error);
            });
    }

    function errorMessage(cartItem, message) {
        cartItem.textContent = message;
        setTimeout(() => {
            cartItem.textContent = '';
        }, 3000)
    }
});