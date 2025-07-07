declare global {
  interface Window {
    paypal?: any;
  }
}
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

type CartItem = {
  id: string | number;
  title: string;
  price: string; // price as string from data
  quantity: number;
  image_link: string;
  brand?: string;
  size?: string;
  color?: string;
};

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated product data — replace with your real product data or API
  const productsData: CartItem[] = [
    { id: 1, title: 'Product 1', price: '10.00', quantity: 0, image_link: '/images/product1.jpg', brand: 'BrandA', size: 'M', color: 'Red' },
    { id: 2, title: 'Product 2', price: '15.50', quantity: 0, image_link: '/images/product2.jpg', brand: 'BrandB', size: 'L', color: 'Blue' },
    // Add more products as needed
  ];

  // Load cart from localStorage and merge with product details
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsed = JSON.parse(storedCart) as { id: number | string; quantity: number }[];
          // Merge stored cart with product data to get full info
          const mergedCart = parsed.map(({ id, quantity }) => {
            const product = productsData.find(p => p.id === id);
            if (!product) return null;
            return { ...product, quantity };
          }).filter(Boolean) as CartItem[];
          setCart(mergedCart);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    // Listen for storage events to update cart if changed in other tabs
    const handleStorageChange = () => loadCart();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save cart to localStorage when cart changes
  useEffect(() => {
    if (!loading) {
      // Store only id and quantity to localStorage to minimize size
      const minimalCart = cart.map(({ id, quantity }) => ({ id, quantity }));
      localStorage.setItem('cart', JSON.stringify(minimalCart));
    }
  }, [cart, loading]);

  // Update quantity for an item
  const updateQuantity = (id: CartItem['id'], newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCart(curr =>
      curr.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Remove item from cart
  const removeItem = (id: CartItem['id']) => {
    setCart(curr => curr.filter(item => item.id !== id));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Calculate total items count and total price
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart
    .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);

  // PayPal setup (assumes `window.paypal` exists)
  const initializePayPal = () => {
    if (window.paypal && cart.length > 0) {
      window.paypal.Buttons({
  createOrder: (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        amount: { value: total },
      }],
    });
  },
      onApprove: (data: any, actions: any) => {
  return actions.order.capture().then((details: any) => {
    alert('Payment complete! Thank you ' + details.payer.name.given_name);
    clearCart();
  });
},
         onError: (err: any) => {
          console.error('PayPal Error:', err);
          alert('Payment failed. Please try again.');
        },
      }).render('#paypal-cart-button');
    }
  };

  useEffect(() => {
    if (!loading && cart.length > 0) {
      const paypalContainer = document.getElementById('paypal-cart-button');
      if (paypalContainer) {
        paypalContainer.innerHTML = '';
      }

      if (window.paypal) {
        initializePayPal();
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID';
        script.onload = initializePayPal;
        document.head.appendChild(script);
      }
    }
  }, [cart, loading, total]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Shopping Cart - Your Store</title>
        <meta name="description" content="Review your cart and checkout" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
              <Link href="/">
                <a className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Continue Shopping
                </a>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg relative">
                    <img
                      src={item.image_link}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-gray-600">${item.price}</p>
                      {item.brand && <p className="text-sm text-gray-500">Brand: {item.brand}</p>}
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-gray-50 p-6 rounded-lg relative">
                {/* Cart count badge */}
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total ({itemCount} items):</span>
                  <span className="text-2xl font-bold text-blue-600">${total}</span>
                </div>

                <div className="space-y-4">
                  <div id="paypal-cart-button"></div>

                  <div className="flex space-x-4">
                    <Link href="/">
                      <a className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-center hover:bg-gray-300 transition-colors">
                        Continue Shopping
                      </a>
                    </Link>
                    <button
                      onClick={clearCart}
                      className="px-6 py-3 text-red-600 hover:text-red-800 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}