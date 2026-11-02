
import { useState, useEffect } from 'react';

import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useNavigate
} from 'react-router-dom';

import { products as defaultProducts, categories } from './data/products.js';
import './App.css';

// ================= LOCAL STORAGE =================

function getSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

// ================= HEADER =================

function Header({ cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topbar">
        Freshly baked with love, every single day!
      </div>

      <header className="navbar">
        <Link className="brand" to="/">
          🍰 BYTES<span className="brand-highlight">-BITES</span>
          <small>BAKERY &amp; SWEETS</small>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/custom-cake">Custom Cake</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="category-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰ Categories
          </button>

          <Link className="account-link" to="/login">
            Login
          </Link>

          <Link className="cart-link" to="/cart">
            🛍️ Cart ({cartCount})
          </Link>
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            {categories.map((category) => (
              <Link
                key={category}
                to={
                  category === 'All Products'
                    ? '/shop'
                    : `/shop?category=${encodeURIComponent(category)}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

// ================= HOME PAGE =================

function HomePage({ productList, onAdd }) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">♡ BAKED FRESH DAILY ♡</span>

          <h1>
            A Little Slice
            <br />
            Of <span>Happiness.</span>
          </h1>

          <p>
            Discover delicious cakes, pastries, and sweet treats
            made with love.
          </p>

          <Link className="primary-btn" to="/shop">
            Explore Our Bakery ↗
          </Link>
        </div>

        <div className="hero-art">
          <span>🎂</span>
        </div>
      </section>

      <section className="features">
        <div>✿ Freshly Baked</div>
        <div>♡ Made with Love</div>
        <div>✧ Quality Ingredients</div>
        <div>☕ Sweeten Your Day</div>
      </section>

      <section className="shop-section">
        <div className="section-heading">
          <span className="eyebrow">OUR BESTSELLERS</span>
          <h2>Our <span>Sweet</span> Favorites</h2>
        </div>

        <ProductGrid
          products={productList.slice(0, 4)}
          onAdd={onAdd}
        />

        <div className="center-action">
          <Link className="primary-btn" to="/shop">
            Shop All Products →
          </Link>
        </div>
      </section>
    </main>
  );
}

// ================= PRODUCT GRID =================

function ProductGrid({ products: list, onAdd }) {
  return (
    <div className="product-grid">
      {list.map((product) => (
        <article className="product-card" key={product.id}>
          <Link
            className="product-image"
            style={{ backgroundColor: product.color || '#fff8f0' }}
            to={`/product/${product.id}`}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="product-photo"
              />
            ) : (
              <span>{product.emoji || '🍰'}</span>
            )}

            <span className="product-tag">FRESH</span>
          </Link>

          <div className="product-info">
            <span className="product-category">
              {product.category}
            </span>

            <Link
              to={`/product/${product.id}`}
              className="product-name"
            >
              <h3>{product.name}</h3>
            </Link>

            <div className="product-bottom">
              <strong>
                Rs. {Number(product.price).toLocaleString('en-PK')}
              </strong>

              <button
                type="button"
                onClick={() => onAdd(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                +
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// ================= SHOP PAGE =================

function ShopPage({ productList, onAdd }) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const requestedCategory = params.get('category') || 'All Products';

  const [category, setCategory] = useState(requestedCategory);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMin, setAppliedMin] = useState('');
  const [appliedMax, setAppliedMax] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  useEffect(() => {
    setCategory(
      categories.includes(requestedCategory)
        ? requestedCategory
        : 'All Products'
    );
  }, [requestedCategory]);

  function chooseCategory(item) {
    setCategory(item);

    const newUrl = item === 'All Products'
      ? '/shop'
      : `/shop?category=${encodeURIComponent(item)}`;

    window.history.replaceState({}, '', newUrl);
  }

  function applyPriceFilter() {
    if (
      (minPrice !== '' && Number(minPrice) < 0) ||
      (maxPrice !== '' && Number(maxPrice) < 0)
    ) {
      alert('Price cannot be negative.');
      return;
    }

    if (
      minPrice !== '' &&
      maxPrice !== '' &&
      Number(minPrice) > Number(maxPrice)
    ) {
      alert('From price cannot be greater than To price.');
      return;
    }

    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
  }

  function clearFilters() {
    setCategory('All Products');
    setSearch('');
    setSort('featured');
    setMinPrice('');
    setMaxPrice('');
    setAppliedMin('');
    setAppliedMax('');

    window.history.replaceState({}, '', '/shop');
  }

  const filtered = productList
    .filter((product) => {
      const matchesCategory =
        category === 'All Products' ||
        product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase().trim());

      const matchesMin =
        appliedMin === '' || product.price >= Number(appliedMin);

      const matchesMax =
        appliedMax === '' || product.price <= Number(appliedMax);

      return matchesCategory && matchesSearch && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

  return (
    <main className="shop-section page-section">
      <div className="section-heading">
        <span className="eyebrow">FRESH FROM OUR BAKERY</span>
        <h1>Shop <span>All Treats</span></h1>
        <p>Find your next favourite sweet treat.</p>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <h2>Filter Products</h2>

          <div className="filter-box">
            <button
              type="button"
              className="filter-heading"
              onClick={() => setCategoryOpen(!categoryOpen)}
            >
              Categories
              <span>{categoryOpen ? '−' : '+'}</span>
            </button>

            {categoryOpen && (
              <div className="filter-options">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={category === item ? 'selected-filter' : ''}
                    onClick={() => chooseCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-box">
            <button
              type="button"
              className="filter-heading"
              onClick={() => setPriceOpen(!priceOpen)}
            >
              Price Range
              <span>{priceOpen ? '−' : '+'}</span>
            </button>

            {priceOpen && (
              <div className="price-filter">
                <label>
                  From (Rs.)
                  <input
                    type="number"
                    min="0"
                    placeholder="Minimum price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </label>

                <label>
                  To (Rs.)
                  <input
                    type="number"
                    min="0"
                    placeholder="Maximum price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="apply-filter-btn"
                  onClick={applyPriceFilter}
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </aside>

        <div className="shop-products-area">
          <div className="shop-toolbar">
            <label>
              Search products
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cakes..."
              />
            </label>

            <label>
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          <p className="results-count">
            {filtered.length} products found
          </p>

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} onAdd={onAdd} />
          ) : (
            <div className="empty-results">
              <h3>No products found</h3>
              <p>Try another category or price range.</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ================= PRODUCT DETAILS =================

function ProductPage({ productList, onAdd }) {
  const { id } = useParams();

  const product = productList.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    return (
      <main className="page-section">
        <h1>Product not found</h1>
        <Link className="primary-btn" to="/shop">
          Back to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="product-detail page-section">
      <div
        className="detail-image"
        style={{ backgroundColor: product.color || '#fff8f0' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-photo"
          />
        ) : (
          <span>{product.emoji || '🍰'}</span>
        )}
      </div>

      <div className="detail-info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <h2>Rs. {Number(product.price).toLocaleString('en-PK')}</h2>
        <p>{product.description}</p>

        <button
          type="button"
          className="primary-btn"
          onClick={() => onAdd(product)}
        >
          Add to Cart
        </button>

        <p><Link to="/shop">← Continue shopping</Link></p>
      </div>
    </main>
  );
}

// ================= CUSTOM CAKE PAGE =================

function CustomCakePage() {
  const [icingColor, setIcingColor] = useState('#f4b6c2');
  const [flavour, setFlavour] = useState('Chocolate');
  const [theme, setTheme] = useState('Birthday');
  const [toppers, setToppers] = useState([]);
  const [message, setMessage] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function handleToppers(e) {
    const value = e.target.value;

    if (e.target.checked) {
      setToppers((current) => [...current, value]);
    } else {
      setToppers((current) =>
        current.filter((item) => item !== value)
      );
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) {
      setReferenceImage(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      e.target.value = '';
      setReferenceImage(null);
      return;
    }

    setReferenceImage(file);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const request = {
      icingColor,
      flavour,
      theme,
      toppers,
      message,
      imageName: referenceImage ? referenceImage.name : '',
      requestDate: new Date().toLocaleString()
    };

    localStorage.setItem(
      'bakeryCustomCakeRequest',
      JSON.stringify(request)
    );

    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);
    setReferenceImage(null);
    setToppers([]);
    setMessage('');
    setIcingColor('#f4b6c2');
    setFlavour('Chocolate');
    setTheme('Birthday');
  }

  return (
    <main className="page-section custom-cake-page">
      <div className="section-heading">
        <span className="eyebrow">DESIGN YOUR DREAM CAKE</span>
        <h1>Customize Your <span>Cake</span></h1>
        <p>Create a cake that matches your special occasion!</p>
      </div>

      {submitted ? (
        <div className="custom-success">
          <h2>Thank You! 🎂</h2>
          <p>Your custom cake request has been saved in this browser.</p>
          <p>
            This is a frontend demo. The request is not yet sent to the bakery.
          </p>

          <button
            className="primary-btn"
            type="button"
            onClick={resetForm}
          >
            Create Another Cake
          </button>
        </div>
      ) : (
        <form
          className="custom-cake-form"
          onSubmit={handleSubmit}
        >
          <label>
            Choose Icing Color
            <div className="color-picker">
              <input
                type="color"
                value={icingColor}
                onChange={(e) => setIcingColor(e.target.value)}
              />
              <span>{icingColor}</span>
            </div>
          </label>

          <label>
            Select Cake Flavour
            <select
              value={flavour}
              onChange={(e) => setFlavour(e.target.value)}
            >
              <option>Chocolate</option>
              <option>Vanilla</option>
              <option>Red Velvet</option>
              <option>Strawberry</option>
              <option>Butterscotch</option>
              <option>Black Forest</option>
            </select>
          </label>

          <label>
            Select Cake Theme
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option>Birthday</option>
              <option>Wedding</option>
              <option>Anniversary</option>
              <option>Floral</option>
              <option>Cartoon</option>
              <option>Graduation</option>
              <option>Simple Elegant</option>
              <option>Other</option>
            </select>
          </label>

          <div className="custom-field">
            <h3>Choose Cake Toppers</h3>

            <div className="toppers-options">
              {[
                'Flowers',
                'Stars',
                'Hearts',
                'Candles',
                'Birthday Topper',
                'Chocolates'
              ].map((item) => (
                <label key={item} className="topper-option">
                  <input
                    type="checkbox"
                    value={item}
                    checked={toppers.includes(item)}
                    onChange={handleToppers}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <label>
            Special Message for Cake
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Example: Happy Birthday!"
              required
            />
          </label>

          <label>
            Upload Reference Image (Optional)
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          <p>
            {referenceImage
              ? `Selected image: ${referenceImage.name}`
              : 'No reference image selected (Optional)'}
          </p>

          <button type="submit" className="primary-btn">
            Submit Custom Cake Request →
          </button>
        </form>
      )}
    </main>
  );
}

// ================= SIMPLE PAGE =================

function SimplePage({ title, children }) {
  return (
    <main className="page-section simple-page">
      <span className="eyebrow">BYTES-BITES BAKERY</span>
      <h1>{title}</h1>
      {children}
    </main>
  );
}

// ================= LOGIN AND SIGNUP =================

function AuthPage({ signup = false }) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleAuth(e) {
    e.preventDefault();

    const users = getSavedData('bakeryUsers', []);

    if (signup) {
      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        alert('This email is already registered. Please login.');
        return;
      }

      users.push({ name, email, password });

      localStorage.setItem('bakeryUsers', JSON.stringify(users));

      localStorage.setItem(
        'bakeryLoggedInUser',
        JSON.stringify({ name, email })
      );

      alert('Account created successfully!');
      navigate('/shop');
    } else {
      const user = users.find(
        (item) =>
          item.email.toLowerCase() === email.toLowerCase() &&
          item.password === password
      );

      if (!user) {
        alert('Invalid email or password. Please try again.');
        return;
      }

      localStorage.setItem(
        'bakeryLoggedInUser',
        JSON.stringify({ name: user.name, email: user.email })
      );

      alert('Login successful!');
      navigate('/shop');
    }
  }

  return (
    <SimplePage title={signup ? 'Create Your Account' : 'Welcome Back'}>
      <form className="auth-form" onSubmit={handleAuth}>
        {signup && (
          <label>
            Full Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </label>
        )}

        <label>
          Email Address
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>

        <button className="primary-btn" type="submit">
          {signup ? 'Create Account' : 'Login'}
        </button>

        <p>
          {signup ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={signup ? '/login' : '/signup'}>
            {signup ? 'Login' : 'Sign Up'}
          </Link>
        </p>
      </form>
    </SimplePage>
  );
}

// ================= CART PAGE =================

function CartPage({ cartItems, onIncrease, onDecrease, onCheckout }) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SimplePage title="Your Shopping Cart">
      {cartItems.length === 0 ? (
        <>
          <p>Your cart is empty. Let's find something sweet!</p>
          <Link className="primary-btn" to="/shop">Start Shopping</Link>
        </>
      ) : (
        <>
          <div className="cart-page-items">
            {cartItems.map((item) => (
              <div className="cart-page-item" key={item.id}>
                <span>{item.emoji || '🍰'}</span>

                <div>
                  <strong>{item.name}</strong>
                  <p>Rs. {item.price.toLocaleString('en-PK')}</p>
                </div>

                <button type="button" onClick={() => onDecrease(item.id)}>
                  -
                </button>

                <span>{item.quantity}</span>

                <button type="button" onClick={() => onIncrease(item.id)}>
                  +
                </button>

                <strong>
                  Rs. {(item.price * item.quantity).toLocaleString('en-PK')}
                </strong>
              </div>
            ))}
          </div>

          <h2>Total: Rs. {total.toLocaleString('en-PK')}</h2>

          <button
            className="primary-btn"
            type="button"
            onClick={onCheckout}
          >
            Proceed to Checkout →
          </button>
        </>
      )}
    </SimplePage>
  );
}

// ================= CHECKOUT PAGE =================

function CheckoutPage({ cartItems }) {
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const loggedInUser = getSavedData('bakeryLoggedInUser', null);

  function placeOrder(e) {
    e.preventDefault();

    if (!loggedInUser) {
      alert('Please login first to place your order.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      navigate('/shop');
      return;
    }

    const order = {
      orderId: Date.now(),
      customer: loggedInUser,
      items: cartItems,
      total,
      orderDate: new Date().toLocaleString(),
      status: 'Order Placed'
    };

    const previousOrders = getSavedData('bakeryOrders', []);
    previousOrders.push(order);

    localStorage.setItem('bakeryOrders', JSON.stringify(previousOrders));
    localStorage.setItem('bakeryCart', JSON.stringify([]));

    alert('Your order has been placed successfully! Thank you for shopping with Bytes-Bites Bakery.');

    navigate('/');
    window.location.reload();
  }

  if (!loggedInUser) {
    return (
      <SimplePage title="Login Required">
        <p>Please login before placing your order.</p>
        <Link className="primary-btn" to="/login">Login Now</Link>
      </SimplePage>
    );
  }

  return (
    <SimplePage title="Checkout">
      {cartItems.length === 0 ? (
        <>
          <p>Your cart is empty.</p>
          <Link className="primary-btn" to="/shop">Shop Products</Link>
        </>
      ) : (
        <form className="auth-form checkout-form" onSubmit={placeOrder}>
          <h2>Delivery Details</h2>

          <label>
            Full Name
            <input required defaultValue={loggedInUser.name} />
          </label>

          <label>
            Email
            <input required type="email" defaultValue={loggedInUser.email} />
          </label>

          <label>
            Phone Number
            <input required type="tel" autoComplete="tel" />
          </label>

          <label>
            Delivery Address
            <textarea required rows="3" autoComplete="street-address" />
          </label>

          <label>
            Payment Method
            <select defaultValue="cod">
              <option value="cod">Cash on Delivery</option>
            </select>
          </label>

          <h2>Order Total: Rs. {total.toLocaleString('en-PK')}</h2>

          <button className="primary-btn" type="submit">
            Place Order
          </button>
        </form>
      )}
    </SimplePage>
  );
}

// ================= ADMIN PANEL =================

function AdminPanel({ productList, setProductList }) {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem('bakeryAdminLoggedIn') === 'true'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activePage, setActivePage] = useState('dashboard');

  const [orders, setOrders] = useState(() =>
    getSavedData('bakeryOrders', [])
  );

  const [customers] = useState(() =>
    getSavedData('bakeryUsers', [])
  );

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('bakeryOrders', JSON.stringify(orders));
  }, [orders]);

  function handleLogin(e) {
    e.preventDefault();

    // Demo admin credentials
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

  function clearForm() {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
  }

  function saveProduct(e) {
    e.preventDefault();

    const newProduct = {
      id: editingId || Date.now(),
      name,
      price: Number(price),
      category,
      description,
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

  function updateOrderStatus(orderId, status) {
    setOrders((current) =>
      current.map((order) =>
        order.orderId === orderId ? { ...order, status } : order
      )
    );
  }

  const totalSales = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  if (!loggedIn) {
    return (
      <main style={adminStyles.loginPage}>
        <form style={adminStyles.loginBox} onSubmit={handleLogin}>
          <h1>🍰 BYTES-BITES</h1>
          <h2>Admin Login</h2>

          <label>Admin Email</label>
          <input
            type="email"
            required
            style={adminStyles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
          />

          <label>Password</label>
          <input
            type="password"
            required
            style={adminStyles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button style={adminStyles.button}>Login</button>
          <Link to="/" style={adminStyles.backLink}>Back to Website</Link>
        </form>
      </main>
    );
  }

  return (
    <div style={adminStyles.layout}>
      <aside style={adminStyles.sidebar}>
        <h2>🍰 BYTES-BITES</h2>
        <p>ADMIN PANEL</p>

        {['dashboard', 'products', 'orders', 'customers'].map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            style={{
              ...adminStyles.menuButton,
              background: activePage === page ? '#cd853f' : 'transparent'
            }}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}

        <Link to="/" style={adminStyles.sideLink}>Visit Website</Link>

        <button onClick={logout} style={adminStyles.logoutButton}>
          Logout
        </button>
      </aside>

      <main style={adminStyles.content}>
        <h1>
          {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </h1>

        {activePage === 'dashboard' && (
          <div style={adminStyles.stats}>
            <div style={adminStyles.statCard}>
              <h3>Total Products</h3>
              <h2>{productList.length}</h2>
            </div>

            <div style={adminStyles.statCard}>
              <h3>Total Orders</h3>
              <h2>{orders.length}</h2>
            </div>

            <div style={adminStyles.statCard}>
              <h3>Total Customers</h3>
              <h2>{customers.length}</h2>
            </div>

            <div style={adminStyles.statCard}>
              <h3>Total Sales</h3>
              <h2>Rs. {totalSales.toLocaleString('en-PK')}</h2>
            </div>
          </div>
        )}

        {activePage === 'products' && (
          <>
            <form style={adminStyles.form} onSubmit={saveProduct}>
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

              <input
                style={adminStyles.input}
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                style={adminStyles.input}
                type="number"
                min="0"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <input
                style={adminStyles.input}
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <textarea
                style={adminStyles.input}
                placeholder="Product Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button style={adminStyles.button}>
                {editingId ? 'Update Product' : 'Add Product'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  style={adminStyles.cancelButton}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <h2>All Products</h2>

            {productList.map((product) => (
              <div key={product.id} style={adminStyles.listItem}>
                <div>
                  <strong>{product.name}</strong>
                  <p>
                    Rs. {product.price} | {product.category}
                  </p>
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
              <div key={order.orderId} style={adminStyles.listItem}>
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
                  style={adminStyles.input}
                  value={order.status || 'Order Placed'}
                  onChange={(e) =>
                    updateOrderStatus(order.orderId, e.target.value)
                  }
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
              <div key={index} style={adminStyles.listItem}>
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

// ================= ADMIN STYLES =================

const adminStyles = {
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
    color: '#39251e',
    flexWrap: 'wrap'
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
    minWidth: '250px'
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

// ================= FOOTER =================

function Footer() {
  return (
    <footer id="contact">
      <Link className="brand footer-brand" to="/">
        🍰 BYTES<span className="brand-highlight">-BITES</span>
      </Link>

      <p>Made with ♡ for every sweet moment.</p>

      <div className="footer-links">
        <Link to="/shop">Shop</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <span>© 2026 Bytes-Bites Bakery</span>
    </footer>
  );
}

// ================= MAIN APP =================

function App() {
  const [cartItems, setCartItems] = useState(() =>
    getSavedData('bakeryCart', [])
  );

  const [productList, setProductList] = useState(() =>
    getSavedData('bakeryAdminProducts', defaultProducts)
  );

  useEffect(() => {
    localStorage.setItem('bakeryCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(
      'bakeryAdminProducts',
      JSON.stringify(productList)
    );
  }, [productList]);

  function addToCart(product) {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });

    alert(`${product.name} added to cart successfully!`);
  }

  function increaseQuantity(id) {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function goToCheckout() {
    const loggedInUser = localStorage.getItem('bakeryLoggedInUser');

    if (!loggedInUser) {
      alert('Please login first to place your order.');
      window.location.href = '/login';
      return;
    }

    window.location.href = '/checkout';
  }

  return (
    <div className="bakery">
      <Header cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage productList={productList} onAdd={addToCart} />
          }
        />

        <Route
          path="/shop"
          element={
            <ShopPage productList={productList} onAdd={addToCart} />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductPage productList={productList} onAdd={addToCart} />
          }
        />

        <Route
          path="/custom-cake"
          element={<CustomCakePage />}
        />

        <Route
          path="/login"
          element={<AuthPage />}
        />

        <Route
          path="/signup"
          element={<AuthPage signup />}
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onCheckout={goToCheckout}
            />
          }
        />

        <Route
          path="/checkout"
          element={<CheckoutPage cartItems={cartItems} />}
        />

        <Route
          path="/admin"
          element={
            <AdminPanel
              productList={productList}
              setProductList={setProductList}
            />
          }
        />

        <Route
          path="/about"
          element={
            <SimplePage title="Our Story">
              <p>
                We bake sweet treats with love, care and quality ingredients.
              </p>
            </SimplePage>
          }
        />

        <Route
          path="/contact"
          element={
            <SimplePage title="Contact Us">
              <div>
                <h2>BYTES-BITES BAKERY</h2>
                <p>
                  <strong>Address:</strong> Lahore, Punjab, Pakistan
                  <br />
                  <strong>Phone:</strong> +92 300 1234567
                  <br />
                  <strong>Email:</strong> bytesbitesbakery@gmail.com
                  <br />
                  <strong>Opening Hours:</strong>
                  <br />
                  Monday – Saturday: 9:00 AM – 10:00 PM
                  <br />
                  Sunday: 10:00 AM – 8:00 PM
                  <br />
                  <strong>Follow Us:</strong> Instagram | Facebook
                  <br />
                  <strong>Message:</strong>
                  <br />
                  Have a question or want to place a custom cake order?
                  Contact us and we'll be happy to help!
                </p>
              </div>
            </SimplePage>
          }
        />

        <Route
          path="*"
          element={
            <SimplePage title="Page Not Found">
              <Link to="/">Return Home</Link>
            </SimplePage>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
