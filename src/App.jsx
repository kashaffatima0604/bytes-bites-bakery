
import { useState, useEffect } from 'react';

import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useNavigate,
} from 'react-router-dom';

import { products, categories } from './data/products.js';
import './App.css';

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

function HomePage({ onAdd }) {
  return (
    <main>

      <section className="hero-section">

        <div className="hero-content">

          <span className="eyebrow">
            ♡ BAKED FRESH DAILY ♡
          </span>

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
          products={products.slice(0, 4)}
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
            style={{ backgroundColor: product.color }}
            to={`/product/${product.id}`}
          >

            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="product-photo"
              />
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
                Rs. {product.price.toLocaleString('en-PK')}
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

function ShopPage({ onAdd }) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const requestedCategory =
    params.get('category') || 'All Products';

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

    const newUrl =
      item === 'All Products'
        ? '/shop'
        : `/shop?category=${encodeURIComponent(item)}`;

    window.history.replaceState({}, '', newUrl);
  }

  function applyPriceFilter() {
    const min = minPrice.trim();
    const max = maxPrice.trim();

    if (
      (min !== '' && Number(min) < 0) ||
      (max !== '' && Number(max) < 0)
    ) {
      alert('Price cannot be negative.');
      return;
    }

    if (
      min !== '' &&
      max !== '' &&
      Number(min) > Number(max)
    ) {
      alert('From price cannot be greater than To price.');
      return;
    }

    setAppliedMin(min);
    setAppliedMax(max);
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

  const filtered = products
    .filter((product) => {

      const matchesCategory =
        category === 'All Products' ||
        product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(
          search.toLowerCase().trim()
        );

      const matchesMin =
        appliedMin === '' ||
        product.price >= Number(appliedMin);

      const matchesMax =
        appliedMax === '' ||
        product.price <= Number(appliedMax);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesMin &&
        matchesMax
      );
    })
    .sort((a, b) => {

      if (sort === 'low') return a.price - b.price;

      if (sort === 'high') return b.price - a.price;

      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }

      return a.id - b.id;
    });

  return (
    <main className="shop-section page-section">

      <div className="section-heading">

        <span className="eyebrow">
          FRESH FROM OUR BAKERY
        </span>

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
                    className={
                      category === item ? 'selected-filter' : ''
                    }
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

            <ProductGrid
              products={filtered}
              onAdd={onAdd}
            />

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

function ProductPage({ onAdd }) {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
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
        style={{ backgroundColor: product.color }}
      >

        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="product-photo"
          />
        )}

      </div>

      <div className="detail-info">

        <span className="eyebrow">
          {product.category}
        </span>

        <h1>{product.name}</h1>

        <h2>
          Rs. {product.price.toLocaleString('en-PK')}
        </h2>

        <p>{product.description}</p>

        <button
          type="button"
          className="primary-btn"
          onClick={() => onAdd(product)}
        >
          Add to Cart
        </button>

        <p>
          <Link to="/shop">← Continue shopping</Link>
        </p>

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
  const [referenceImages, setReferenceImages] = useState([]);
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

  function handleImages(e) {
    const files = Array.from(e.target.files || []);
    setReferenceImages(files);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (referenceImages.length < 2) {
      alert('Please upload at least 2 reference images.');
      return;
    }

    const customCakeRequest = {
      icingColor,
      flavour,
      theme,
      toppers,
      message,
      imageNames: referenceImages.map((file) => file.name),
      requestDate: new Date().toLocaleString()
    };

    localStorage.setItem(
      'bakeryCustomCakeRequest',
      JSON.stringify(customCakeRequest)
    );

    setSubmitted(true);
  }

  return (
    <main className="page-section custom-cake-page">

      <div className="section-heading">

        <span className="eyebrow">
          DESIGN YOUR DREAM CAKE
        </span>

        <h1>Customize Your <span>Cake</span></h1>

        <p>
          Create a cake that matches your special occasion!
        </p>

      </div>

      {submitted ? (

        <div className="custom-success">

          <h2>Thank You! 🎂</h2>

          <p>
            Your custom cake request has been saved in this browser.
          </p>

          <p>
            This is a frontend demo. The request is not yet sent
            to the bakery or saved in a database.
          </p>

          <button
            className="primary-btn"
            type="button"
            onClick={() => {
              setSubmitted(false);
              setReferenceImages([]);
              setToppers([]);
              setMessage('');
            }}
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
                'Chocolates',
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
            Upload Reference Images (Minimum 2)

            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={handleImages}
            />

          </label>

          {referenceImages.length > 0 && (

            <div className="reference-preview">

              <h3>
                Uploaded Images ({referenceImages.length})
              </h3>

              <div className="reference-images">

                {referenceImages.map((file, index) => (

                  <div key={`${file.name}-${index}`}>

                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Reference ${index + 1}`}
                    />

                    <p>{file.name}</p>

                  </div>

                ))}

              </div>

            </div>

          )}

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

      <span className="eyebrow">
        BYTES-BITES BAKERY
      </span>

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

    const users = JSON.parse(
      localStorage.getItem('bakeryUsers') || '[]'
    );

    if (signup) {

      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        alert('This email is already registered. Please login.');
        return;
      }

      const newUser = {
        name: name,
        email: email,
        password: password
      };

      users.push(newUser);

      localStorage.setItem(
        'bakeryUsers',
        JSON.stringify(users)
      );

      localStorage.setItem(
        'bakeryLoggedInUser',
        JSON.stringify({
          name: name,
          email: email
        })
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
        JSON.stringify({
          name: user.name,
          email: user.email
        })
      );

      alert('Login successful!');

      navigate('/shop');
    }
  }

  return (
    <SimplePage
      title={signup ? 'Create Your Account' : 'Welcome Back'}
    >

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
          {signup
            ? 'Already have an account? '
            : "Don't have an account? "}

          <Link to={signup ? '/login' : '/signup'}>
            {signup ? 'Login' : 'Sign Up'}
          </Link>

        </p>

      </form>

    </SimplePage>
  );
}

// ================= CART PAGE =================

function CartPage({
  cartItems,
  onIncrease,
  onDecrease,
  onCheckout
}) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SimplePage title="Your Shopping Cart">

      {cartItems.length === 0 ? (

        <>
          <p>
            Your cart is empty. Let's find something sweet!
          </p>

          <Link className="primary-btn" to="/shop">
            Start Shopping
          </Link>
        </>

      ) : (

        <>

          <div className="cart-page-items">

            {cartItems.map((item) => (

              <div className="cart-page-item" key={item.id}>

                <span>{item.emoji || '🍰'}</span>

                <div>

                  <strong>{item.name}</strong>

                  <p>
                    Rs. {item.price.toLocaleString('en-PK')}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => onDecrease(item.id)}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  onClick={() => onIncrease(item.id)}
                >
                  +
                </button>

                <strong>
                  Rs. {(item.price * item.quantity).toLocaleString('en-PK')}
                </strong>

              </div>

            ))}

          </div>

          <h2>
            Total: Rs. {total.toLocaleString('en-PK')}
          </h2>

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

  const loggedInUser = JSON.parse(
    localStorage.getItem('bakeryLoggedInUser') || 'null'
  );

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
      total: total,
      orderDate: new Date().toLocaleString(),
      status: 'Order Placed'
    };

    const previousOrders = JSON.parse(
      localStorage.getItem('bakeryOrders') || '[]'
    );

    previousOrders.push(order);

    localStorage.setItem(
      'bakeryOrders',
      JSON.stringify(previousOrders)
    );

    localStorage.removeItem('bakeryCart');

    alert(
      'Your order has been placed successfully! Thank you for shopping with Bytes-Bites Bakery.'
    );

    window.location.href = '/';
  }

  if (!loggedInUser) {
    return (
      <SimplePage title="Login Required">

        <p>
          Please login before placing your order.
        </p>

        <Link className="primary-btn" to="/login">
          Login Now
        </Link>

      </SimplePage>
    );
  }

  return (
    <SimplePage title="Checkout">

      {cartItems.length === 0 ? (

        <>
          <p>Your cart is empty.</p>

          <Link className="primary-btn" to="/shop">
            Shop Products
          </Link>
        </>

      ) : (

        <form
          className="auth-form checkout-form"
          onSubmit={placeOrder}
        >

          <h2>Delivery Details</h2>

          <label>
            Full Name

            <input
              required
              defaultValue={loggedInUser.name}
            />

          </label>

          <label>
            Email

            <input
              required
              type="email"
              defaultValue={loggedInUser.email}
            />

          </label>

          <label>
            Phone Number

            <input
              required
              type="tel"
              autoComplete="tel"
            />

          </label>

          <label>
            Delivery Address

            <textarea
              required
              rows="3"
              autoComplete="street-address"
            />

          </label>

          <label>
            Payment Method

            <select defaultValue="cod">
              <option value="cod">Cash on Delivery</option>
            </select>

          </label>

          <h2>
            Order Total: Rs. {total.toLocaleString('en-PK')}
          </h2>

          <button className="primary-btn" type="submit">
            Place Order
          </button>

        </form>

      )}

    </SimplePage>
  );
}

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

  // Load saved cart from browser

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('bakeryCart');

    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart whenever it changes

  useEffect(() => {
    localStorage.setItem(
      'bakeryCart',
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // Add product to cart

  function addToCart(product) {

    setCartItems((items) => {

      const existing = items.find(
        (item) => item.id === product.id
      );

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

  // Increase quantity

  function increaseQuantity(id) {

    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

  }

  // Decrease quantity

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

  // Total cart quantity

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Check login before checkout

  function goToCheckout() {

    const loggedInUser = localStorage.getItem(
      'bakeryLoggedInUser'
    );

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
            <HomePage onAdd={addToCart} />
          }
        />

        <Route
          path="/shop"
          element={
            <ShopPage onAdd={addToCart} />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductPage onAdd={addToCart} />
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
          element={
            <CheckoutPage cartItems={cartItems} />
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
              <p>
                 
**BYTES-BITES BAKERY**

**Address:** Lahore, Punjab, Pakistan

**Phone:** +92 300 1234567  
*(Demo number — apna actual ya business contact number use karna.)*

**Email:** bytesbitesbakery@gmail.com  
*(Agar ye email available nahi hai, apni existing business/project email use karna.)*

**Opening Hours:**
- Monday – Saturday: 9:00 AM – 10:00 PM
- Sunday: 10:00 AM – 8:00 PM

**Follow Us:** Instagram | Facebook

**Message:** Have a question or want to place a custom cake order? Contact us and we'll be happy to help!
              </p>
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