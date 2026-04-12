(function () {
    if (!window.APP_CONFIG || !window.MENU_ITEMS || !window.BILL_RECEIPT_CSS) {
        console.error('Billing app: missing config, menu, or bill-receipt-css script.');
        return;
    }

    const cfg = window.APP_CONFIG;
    const menu = window.MENU_ITEMS;

    let cart = [];

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function setupHeaderImages() {
        const imgs = document.querySelectorAll('.header-deity img');
        const fb = cfg.deityFallback;
        if (imgs[0]) {
            imgs[0].addEventListener('error', function onErr() {
                this.removeEventListener('error', onErr);
                this.src = fb.ganesha;
                this.referrerPolicy = 'no-referrer';
            });
        }
        if (imgs[1]) {
            imgs[1].addEventListener('error', function onErr() {
                this.removeEventListener('error', onErr);
                this.src = fb.lakshmi;
                this.referrerPolicy = 'no-referrer';
            });
        }
    }

    function loadFoodGrid(searchTerm) {
        const grid = document.getElementById('foodGrid');
        const q = (searchTerm || '').toLowerCase().trim();
        const filteredMenu = menu.filter(function (item) {
            return item.name.toLowerCase().includes(q);
        });

        if (filteredMenu.length === 0) {
            grid.innerHTML = '<div class="empty-cart">No items match your search.</div>';
            return;
        }

        grid.innerHTML = filteredMenu.map(function (item) {
            return (
                '<div class="food-card" onclick="addToCart(' + item.id + ')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\')addToCart(' + item.id + ')">' +
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" width="480" height="360" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'https://via.placeholder.com/480x360/f1f5f9/64748b?text=' + encodeURIComponent(item.name) + '\';">' +
                '<h3>' + escapeHtml(item.name) + '</h3>' +
                '<div class="price">₹' + item.price + '</div>' +
                '</div>'
            );
        }).join('');
    }

    function addToCart(itemId) {
        const item = menu.find(function (i) { return i.id === itemId; });
        if (!item) return;
        const existingItem = cart.find(function (i) { return i.id === itemId; });

        if (existingItem) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                total: item.price
            });
        }

        updateCart();
        showNotification('Added: ' + item.name);
    }

    function updateQuantity(itemId, change) {
        const item = cart.find(function (i) { return i.id === itemId; });
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(function (i) { return i.id !== itemId; });
            } else {
                item.total = item.quantity * item.price;
            }
            updateCart();
        }
    }

    function removeItem(itemId) {
        cart = cart.filter(function (i) { return i.id !== itemId; });
        updateCart();
        showNotification('Item removed');
    }

    function updateCart() {
        const cartContainer = document.getElementById('cartItems');
        const total = cart.reduce(function (sum, item) { return sum + item.total; }, 0);

        if (cart.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart">Cart is empty.<br>Add items from the menu.</div>';
        } else {
            cartContainer.innerHTML = cart.map(function (item) {
                return (
                    '<div class="cart-item">' +
                    '<div class="cart-item-info">' +
                    '<div class="cart-item-name">' + escapeHtml(item.name) + '</div>' +
                    '<div class="cart-item-price">₹' + item.price + ' each</div>' +
                    '</div>' +
                    '<div class="cart-item-controls">' +
                    '<button type="button" onclick="updateQuantity(' + item.id + ', -1)" aria-label="Decrease quantity">−</button>' +
                    '<span class="cart-item-quantity">' + item.quantity + '</span>' +
                    '<button type="button" onclick="updateQuantity(' + item.id + ', 1)" aria-label="Increase quantity">+</button>' +
                    '<button type="button" class="remove-btn" onclick="removeItem(' + item.id + ')" aria-label="Remove item">×</button>' +
                    '</div>' +
                    '<div class="cart-item-total">₹' + item.total + '</div>' +
                    '</div>'
                );
            }).join('');
        }

        document.getElementById('billSummary').innerHTML =
            '<div class="summary-row total">' +
            '<span>Total</span>' +
            '<span>₹' + total.toFixed(2) + '</span>' +
            '</div>';
    }

    function buildReceiptHtml() {
        const total = cart.reduce(function (sum, item) { return sum + item.total; }, 0);
        const now = new Date();
        const dateStr = now.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
        const billNo = 'BILL-' + now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '-' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');

        const itemRows = cart.map(function (item) {
            const left = item.quantity + ' x ' + item.name;
            const right = '\u20B9' + item.total.toFixed(2);
            return '<div class="rline"><span class="l">' + escapeHtml(left) + '</span><span class="r">' + right + '</span></div>';
        }).join('');

        return (
            '<div class="center shop">' + escapeHtml(cfg.SHOP_NAME) + '</div>' +
            '<div class="center owner">Prop.: ' + escapeHtml(cfg.OWNER_NAME) + '</div>' +
            '<div class="center addr">' + escapeHtml(cfg.SHOP_ADDRESS) + '</div>' +
            (cfg.PHONE ? '<div class="center sub">Ph: ' + escapeHtml(cfg.PHONE) + '</div>' : '') +
            '<div class="center sub">' + escapeHtml(dateStr) + '</div>' +
            '<div class="center sub">Bill: ' + escapeHtml(billNo) + '</div>' +
            '<hr class="rule">' +
            '<div class="rline"><span class="l">ITEM</span><span class="r">AMT</span></div>' +
            '<hr class="rule-bold">' +
            itemRows +
            '<hr class="rule-bold">' +
            '<div class="rline tot"><span class="l">TOTAL</span><span class="r">\u20B9' + total.toFixed(2) + '</span></div>' +
            '<div class="thanks">Thank you. Visit again.</div>'
        );
    }

    function openBillModal() {
        const modal = document.getElementById('billModal');
        const frame = document.getElementById('billFrame');
        const receiptInner = buildReceiptHtml();
        const docHtml =
            '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
            '<style>' + window.BILL_RECEIPT_CSS + '</style></head><body>' +
            '<div class="receipt-wrap"><div class="receipt">' + receiptInner + '</div></div>' +
            '</body></html>';

        frame.srcdoc = docHtml;
        modal.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeBillModal() {
        const modal = document.getElementById('billModal');
        const frame = document.getElementById('billFrame');
        modal.setAttribute('hidden', '');
        modal.setAttribute('aria-hidden', 'true');
        frame.srcdoc = '';
        document.body.style.overflow = '';
    }

    function printBillFromModal() {
        const frame = document.getElementById('billFrame');
        try {
            if (frame.contentWindow) {
                frame.contentWindow.focus();
                frame.contentWindow.print();
            }
        } catch (e) {
            alert('Could not open print dialog.');
        }
    }

    function showBillPopup() {
        if (cart.length === 0) {
            alert('Cart is empty. Add items before viewing the bill.');
            return;
        }
        openBillModal();
    }

    function saveOrder() {
        if (cart.length === 0) {
            alert('Cart is empty. Add items before saving.');
            return;
        }
        localStorage.setItem(cfg.STORAGE_KEY, JSON.stringify(cart));
        alert('Order saved. You can load it later from the cart actions.');
    }

    function loadSavedOrder() {
        const saved = localStorage.getItem(cfg.STORAGE_KEY);
        if (saved) {
            try {
                cart = JSON.parse(saved);
                cart = cart.map(function (row) {
                    return {
                        id: row.id,
                        name: row.name,
                        price: row.price,
                        quantity: row.quantity,
                        total: row.total
                    };
                });
                updateCart();
                alert('Saved order loaded.');
            } catch (e) {
                alert('Could not load saved order.');
            }
        } else {
            alert('No saved order found.');
        }
    }

    function clearCart() {
        if (confirm('Clear all items from the cart?')) {
            cart = [];
            updateCart();
            showNotification('Cart cleared');
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = [
            'position:fixed',
            'bottom:20px',
            'right:20px',
            'background:#0f172a',
            'color:#f8fafc',
            'padding:12px 18px',
            'border-radius:6px',
            'font-size:14px',
            'font-weight:600',
            'z-index:1000',
            'box-shadow:0 4px 12px rgba(0,0,0,0.15)'
        ].join(';');
        document.body.appendChild(notification);
        setTimeout(function () { notification.remove(); }, 2200);
    }

    window.addToCart = addToCart;
    window.updateQuantity = updateQuantity;
    window.removeItem = removeItem;
    window.showBillPopup = showBillPopup;
    window.saveOrder = saveOrder;
    window.loadSavedOrder = loadSavedOrder;
    window.clearCart = clearCart;

    document.getElementById('searchInput').addEventListener('input', function (e) {
        loadFoodGrid(e.target.value);
    });

    document.getElementById('btnViewBill').addEventListener('click', showBillPopup);
    document.getElementById('btnSaveOrder').addEventListener('click', saveOrder);
    document.getElementById('btnClearCart').addEventListener('click', clearCart);

    document.getElementById('billModalClose').addEventListener('click', closeBillModal);
    document.getElementById('billModalPrint').addEventListener('click', printBillFromModal);
    document.getElementById('billModalBackdrop').addEventListener('click', closeBillModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('billModal');
            if (modal && !modal.hasAttribute('hidden')) {
                closeBillModal();
            }
        }
    });

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'btn btn-secondary';
    loadBtn.textContent = 'Load saved order';
    loadBtn.addEventListener('click', loadSavedOrder);
    document.querySelector('.action-buttons').appendChild(loadBtn);

    setupHeaderImages();
    loadFoodGrid('');
})();
