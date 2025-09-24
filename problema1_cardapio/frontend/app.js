document.addEventListener('DOMContentLoaded', () => {
    let menuItems = [];
    let cart = [];
    let activeCategory = 'Todos'; // Nova variável de estado para o filtro

    const menuContainer = document.getElementById('menu-items-container');
    const searchInput = document.getElementById('search-input');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalValue = document.getElementById('cart-total-value');
    const orderForm = document.getElementById('order-form');
    const feedbackMessage = document.getElementById('feedback-message');

    async function fetchMenu() {
        try {
            const response = await fetch('http://localhost:3000/cardapio');
            if (!response.ok) throw new Error('Não foi possível carregar o cardápio.');
            
            const data = await response.json();
            menuItems = data;
            
            renderCategoryFilters();
            filterAndRenderMenu();
        } catch (error) {
            console.error('Erro ao buscar o cardápio:', error);
            showFeedback('Erro ao carregar o cardápio.', 'error');
        }
    }

    function renderCategoryFilters() {
        const categories = ['Todos', ...new Set(menuItems.map(item => item.categoria))];
        categoryFiltersContainer.innerHTML = '';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.textContent = category;
            button.dataset.category = category;
            if (category === activeCategory) {
                button.classList.add('active');
            }
            categoryFiltersContainer.appendChild(button);
        });
    }

    function filterAndRenderMenu() {
        let filteredItems = menuItems;

        if (activeCategory !== 'Todos') {
            filteredItems = filteredItems.filter(item => item.categoria === activeCategory);
        }

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                item.nome.toLowerCase().includes(searchTerm)
            );
        }
        
        renderMenu(filteredItems);
    }
    
    function renderMenu(items) {
        menuContainer.innerHTML = '';
        if (items.length === 0) {
            menuContainer.innerHTML = '<p>Nenhum item encontrado com os filtros selecionados.</p>';
            return;
        }

        items.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'menu-item';
            menuItemElement.innerHTML = `
                <h3>${item.nome}</h3>
                <p>Categoria: ${item.categoria}</p>
                <p class="price"><strong>R$ ${item.preco.toFixed(2)}</strong></p>
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

    async function handleOrderSubmit(event) {
        event.preventDefault();
        const nomeCliente = document.getElementById('cliente-nome').value;
        const observacoes = document.getElementById('cliente-observacoes').value;

        if (!nomeCliente || cart.length === 0) {
            showFeedback(cart.length === 0 ? 'Seu carrinho está vazio.' : 'Por favor, informe seu nome.', 'error');
            return;
        }

        const pedido = {
            nomeCliente, observacoes, itens: cart, total: parseFloat(cartTotalValue.textContent)
        };

        try {
            const response = await fetch('http://localhost:3000/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido),
            });
            if (!response.ok) throw new Error('Erro ao enviar o pedido.');
            
            const result = await response.json();
            showFeedback(result.message, 'success');
            orderForm.reset();
            cart = [];
            renderCart();
        } catch (error) {
            console.error('Erro no pedido:', error);
            showFeedback('Não foi possível enviar o pedido. Tente novamente.', 'error');
        }
    }

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = 'feedback-message';
        feedbackMessage.classList.add(type);
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
            feedbackMessage.classList.remove('success', 'error');
        }, 5000);
    }
    
    searchInput.addEventListener('input', filterAndRenderMenu);

    categoryFiltersContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            activeCategory = event.target.dataset.category;
            document.querySelector('.category-btn.active').classList.remove('active');
            event.target.classList.add('active');
            filterAndRenderMenu();
        }
    });

    menuContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(event.target.getAttribute('data-id'));
            addToCart(itemId);
        }
    });
    
    orderForm.addEventListener('submit', handleOrderSubmit);
    
    fetchMenu();
});