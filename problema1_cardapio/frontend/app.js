document.addEventListener('DOMContentLoaded', () => {
    let menuItems = [];
    let cart = [];

    const menuContainer = document.getElementById('menu-items-container');
    const searchInput = document.getElementById('search-input');
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalValue = document.getElementById('cart-total-value');
    const orderForm = document.getElementById('order-form');
    const feedbackMessage = document.getElementById('feedback-message');

    async function fetchMenu() {
        try {
            const response = await fetch('http://localhost:3000/cardapio');
            if (!response.ok) {
                throw new Error('Não foi possível carregar o cardápio.');
            }
            const data = await response.json();
            menuItems = data;
            renderMenu(menuItems);
        } catch (error) {
            console.error('Erro ao buscar o cardápio:', error);
            showFeedback('Erro ao carregar o cardápio. Tente novamente mais tarde.', 'error');
        }
    }

    function renderMenu(items) {
        menuContainer.innerHTML = '';
        if (items.length === 0) {
            menuContainer.innerHTML = '<p>Nenhum item encontrado.</p>';
            return;
        }

        items.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'menu-item';
            menuItemElement.innerHTML = `
                <h3>${item.nome}</h3>
                <p>Categoria: ${item.categoria}</p>
                <p><strong>Preço: R$ ${item.preco.toFixed(2)}</strong></p>
                <button class="add-to-cart-btn" data-id="${item.id}">Adicionar</button>
            `;
            menuContainer.appendChild(menuItemElement);
        });
    }

    function addToCart(itemId) {
        const itemToAdd = menuItems.find(item => item.id === itemId);
        if (!itemToAdd) return;

        const existingCartItem = cart.find(item => item.id === itemId);

        if (existingCartItem) {
            existingCartItem.quantity++;
        } else {
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        renderCart();
    }

    function renderCart() {
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                const cartItemElement = document.createElement('li');
                const subtotal = item.preco * item.quantity;
                cartItemElement.innerHTML = `
                    <span>${item.nome} (x${item.quantity})</span>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                `;
                cartItemsList.appendChild(cartItemElement);
            });
        }
        updateCartTotal();
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
        cartTotalValue.textContent = total.toFixed(2);
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = menuItems.filter(item =>
            item.nome.toLowerCase().includes(searchTerm)
        );
        renderMenu(filteredItems);
    }

    async function handleOrderSubmit(event) {
        event.preventDefault();

        const nomeCliente = document.getElementById('cliente-nome').value;
        const observacoes = document.getElementById('cliente-observacoes').value;

        if (!nomeCliente) {
            showFeedback('Por favor, informe seu nome.', 'error');
            return;
        }
        if (cart.length === 0) {
            showFeedback('Seu carrinho está vazio. Adicione itens para fazer um pedido.', 'error');
            return;
        }

        const pedido = {
            nomeCliente,
            observacoes,
            itens: cart,
            total: parseFloat(cartTotalValue.textContent)
        };

        try {
            const response = await fetch('http://localhost:3000/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedido),
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar o pedido.');
            }

            const result = await response.json();
            showFeedback(result.message, 'success');
            
            orderForm.reset();
            cart = [];
            renderCart();

        } catch (error) {
            console.error('Erro no pedido:', error);
            showFeedback('Não foi possível enviar o pedido. Tente novamente.', 'error');
        }

        setTimeout(() => {
            feedbackMessage.style.display = 'none';
            feedbackMessage.classList.remove('success', 'error');
        }, 5000);
    }

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = 'feedback-message';
        feedbackMessage.classList.add(type);
        feedbackMessage.style.display = 'block';
    }

    fetchMenu();
    searchInput.addEventListener('input', handleSearch);
    menuContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(event.target.getAttribute('data-id'));
            addToCart(itemId);
        }
    });
    orderForm.addEventListener('submit', handleOrderSubmit);
});