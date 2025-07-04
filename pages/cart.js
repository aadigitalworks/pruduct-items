import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = () => {
      try {
        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(items);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const initializePayPal = () => {
    if (window.paypal && cart.length > 0) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { 
                value: total 
              },
              description: `Order of ${itemCount} items`
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            alert('Payment complete! Thank you ' + details.payer.name.given_name);
            clearCart();
          });
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          alert('Payment failed. Please try again.');
        }
      }).render('#paypal-cart-button');
    }
  };

  useEffect(() => {
    if (!loading && cart.length > 0) {
      // Clear any existing PayPal buttons
      const paypalContainer = document.getElementById('paypal-cart-button');
      if (paypalContainer) {
        paypalContainer.innerHTML = '';
      }

      // Initialize PayPal
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
              <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
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
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total ({itemCount} items):</span>
                  <span className="text-2xl font-bold text-blue-600">${total}</span>
                </div>
                
                <div className="space-y-4">
                  <div id="paypal-cart-button"></div>
                  
                  <div className="flex space-x-4">
                    <Link href="/" className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-center hover:bg-gray-300 transition-colors">
                      Continue Shopping
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