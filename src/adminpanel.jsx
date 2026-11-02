
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products as defaultProducts } from './data/products.js';

function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem('bakeryAdminLoggedIn') === 'true'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [productList, setProductList] = useState(() => {
    return JSON.parse(
      localStorage.getItem('bakeryAdminProducts') ||
      JSON.stringify(defaultProducts)
    );
  });

  const [orders, setOrders] = useState(() => {
    return JSON.parse(localStorage.getItem('bakeryOrders') || '[]');
  });

  const [customers, setCustomers] = useState(() => {
    return JSON.parse(localStorage.getItem('bakeryUsers') || '[]');
  });

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem(
      'bakeryAdminProducts',
      JSON.stringify(productList)
    );
  }, [productList]);

  useEffect(() => {
    localStorage.setItem('bakeryOrders', JSON.stringify(orders));
  }, [orders]);

  function handleLogin(e) {
    e.preventDefault();

    // Demo credentials
    if (
      email === 'admin@bytesbites.com' &&
      password === 'admin123'
    ) {
      localStorage.setItem('bakeryAdminLoggedIn', 'true');
      setLoggedIn(true);
    } else {
      alert('Invalid admin email or password!');
    }
  }

  function logout() {
    localStorage.removeItem('bakeryAdminLoggedIn');
    setLoggedIn(false);
  }

  function saveProduct(e) {
    e.preventDefault();

    const newProduct = {
      id: editingId || Date.now(),
      name: name,
      price: Number(price),
      category: category,
      description: description,
      color: '#fff8f0',
      emoji: '🍰'
    };

    if (editingId) {
      setProductList((current) =>
        current.map((item) =>
          item.id === editingId ? { ...item, ...newProduct } : item
        )
      );
    } else {
      setProductList((current) => [...current, newProduct]);
    }

    clearForm();
    alert('Product saved successfully!');
  }

  function editProduct(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setDescription(product.description || '');
    setActivePage('products');
  }

  function deleteProduct(id) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProductList((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  }

  function clearForm() {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
  }

  function updateOrderStatus(orderId, status) {
    setOrders((current) =>
      current.map((order) =>
        order.orderId === orderId
          ? { ...order, status: status }
          : order
      )
    );
  }

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  if (!loggedIn) {
    return (
      <main style={styles.loginPage}>
        <form style={styles.loginBox} onSubmit={handleLogin}>
          <h1>🍰 BYTES-BITES</h1>
          <h2>Admin Login</h2>

          <label>Admin Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            style={styles.input}
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={styles.input}
          />

          <button style={styles.button}>Login</button>
          <Link to="/" style={styles.backLink}>Back to Website</Link>
        </form>
      </main>
    );
  }

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h2>🍰 BYTES-BITES</h2>
        <p>ADMIN PANEL</p>

        {['dashboard', 'products', 'orders', 'customers'].map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            style={{
              ...styles.menuButton,
              background: activePage === page ? '#cd853f' : 'transparent'
            }}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}

        <Link to="/" style={styles.sideLink}>Visit Website</Link>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </aside>

      <main style={styles.content}>
        <h1>
          {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </h1>

        {activePage === 'dashboard' && (
          <>
            <div style={styles.stats}>
              <div style={styles.statCard}>
                <h3>Total Products</h3>
                <h2>{productList.length}</h2>
              </div>
              <div style={styles.statCard}>
                <h3>Total Orders</h3>
                <h2>{orders.length}</h2>
              </div>
              <div style={styles.statCard}>
                <h3>Total Customers</h3>
                <h2>{customers.length}</h2>
              </div>
              <div style={styles.statCard}>
                <h3>Total Sales</h3>
                <h2>Rs. {totalSales.toLocaleString('en-PK')}</h2>
              </div>
            </div>
          </>
        )}

        {activePage === 'products' && (
          <>
            <form style={styles.form} onSubmit={saveProduct}>
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

              <input
                style={styles.input}
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                style={styles.input}
                type="number"
                min="0"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <input
                style={styles.input}
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <textarea
                style={styles.input}
                placeholder="Product Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button style={styles.button}>
                {editingId ? 'Update Product' : 'Add Product'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  style={styles.cancelButton}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <h2>All Products</h2>

            {productList.map((product) => (
              <div key={product.id} style={styles.listItem}>
                <div>
                  <strong>{product.name}</strong>
                  <p>Rs. {product.price} | {product.category}</p>
                </div>
                <button onClick={() => editProduct(product)}>
                  Edit
                </button>
                <button onClick={() => deleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            ))}
          </>
        )}

        {activePage === 'orders' && (
          <>
            <h2>Customer Orders</h2>

            {orders.length === 0 && <p>No orders yet.</p>}

            {orders.map((order) => (
              <div key={order.orderId} style={styles.listItem}>
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p>Customer: {order.customer?.name}</p>
                  <p>Email: {order.customer?.email}</p>
                  <p>Total: Rs. {order.total}</p>
                  <p>Date: {order.orderDate}</p>
                  <p>
                    Items: {order.items?.map((item) =>
                      `${item.name} x ${item.quantity}`
                    ).join(', ')}
                  </p>
                </div>

                <select
                  value={order.status || 'Order Placed'}
                  onChange={(e) =>
                    updateOrderStatus(order.orderId, e.target.value)
                  }
                  style={styles.input}
                >
                  <option>Order Placed</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            ))}
          </>
        )}

        {activePage === 'customers' && (
          <>
            <h2>Registered Customers</h2>

            {customers.length === 0 && <p>No customers registered yet.</p>}

            {customers.map((customer, index) => (
              <div key={index} style={styles.listItem}>
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.email}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff8f0',
    padding: '30px'
  },
  loginBox: {
    background: 'white',
    padding: '35px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: '1px solid #ead9c9'
  },
  layout: {
    display: 'flex',
    minHeight: '75vh',
    background: '#fff8f0',
    color: '#39251e'
  },
  sidebar: {
    width: '220px',
    background: '#39251e',
    color: 'white',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  content: {
    flex: 1,
    padding: '30px',
    minWidth: 0
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #ead9c9'
  },
  form: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '25px',
    maxWidth: '550px'
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px',
    margin: '10px 0',
    border: '1px solid #ead9c9',
    borderRadius: '6px'
  },
  button: {
    background: '#75452f',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  menuButton: {
    color: 'white',
    border: 'none',
    padding: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '6px'
  },
  sideLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '12px'
  },
  logoutButton: {
    background: '#cd853f',
    color: 'white',
    border: 'none',
    padding: '12px',
    cursor: 'pointer',
    borderRadius: '6px',
    marginTop: 'auto'
  },
  listItem: {
    background: 'white',
    border: '1px solid #ead9c9',
    borderRadius: '8px',
    padding: '15px',
    margin: '12px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  cancelButton: {
    padding: '10px',
    marginLeft: '10px',
    cursor: 'pointer'
  },
  backLink: {
    textAlign: 'center',
    color: '#75452f'
  }
};

export default AdminPanel;
