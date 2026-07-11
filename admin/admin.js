// ==========================================
// 1. HANDLE LOGIN LOGIC (For login.html)
// ==========================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json();
            
            if (data.success) {
                // Set auth token and redirect to dashboard
                localStorage.setItem('adminAuth', 'true');
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid Credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Server error during login.');
        }
    });
}

// ==========================================
// 2. HANDLE DASHBOARD LOGIC (For dashboard.html)
// ==========================================
const addProductForm = document.getElementById('addProductForm');

if (addProductForm) {
    // Load products immediately when the dashboard opens
    loadProducts();

    // Handle adding a new product
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('image', document.getElementById('image').files[0]);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                addProductForm.reset(); // Clear the form
                loadProducts();         // Refresh the product list
                alert('Product added successfully!');
            } else {
                alert('Failed to add product.');
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    });
}

// ==========================================
// 3. FETCH AND DISPLAY PRODUCTS
// ==========================================
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        const list = document.getElementById('productList');
        
        if (products.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:#888;">No products found. Add one above!</p>';
            return;
        }

        list.innerHTML = products.map(p => `
            <div class="product-item">
                <div style="display:flex; align-items:center;">
                    <img src="${p.img}" alt="${p.name}">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small>₹${p.price} | ${p.category}</small>
                    </div>
                </div>
                <button class="btn del-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// ==========================================
// 4. DELETE PRODUCT
// ==========================================
async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This will remove it from the live website.')) {
        try {
            const res = await fetch(`/api/products/${id}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                loadProducts(); // Refresh the list after deleting
            } else {
                alert('Failed to delete product.');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
}