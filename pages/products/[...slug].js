import { useEffect, useState } from 'react';
import Head from 'next/head';

// Replace with your Google Apps Script URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxzDrJ5sIHKSf5zmcxwwhU25dmJWGtpU_tYRhMQrkwu921ZSGtz3rvXyqnL2DawPe3w/exec';

export async function getStaticPaths() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    const paths = products.map(product => ({
      params: {
        slug: product.subcategory_slug
          ? [product.category_slug, product.subcategory_slug, product.product_slug]
          : [product.category_slug, product.product_slug],
      }
    }));

    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    const [category, subOrSlug, maybeSlug] = params.slug;
    
    const product = maybeSlug
      ? products.find(p => 
          p.category_slug === category && 
          p.subcategory_slug === subOrSlug && 
          p.product_slug === maybeSlug
        )
      : products.find(p => 
          p.category_slug === category && 
          !p.subcategory_slug && 
          p.product_slug === subOrSlug
        );

    if (!product) {
      return { notFound: true };
    }

    return { 
      props: { product }
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
}

export default function ProductPage({ product }) {
  const [cart, setCart] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = () => {
    setIsAddingToCart(true);
    try {
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = existingCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        existingCart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem("cart", JSON.stringify(existingCart));
      setCart(existingCart);
      alert("Added to cart!");
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert("Error adding to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const initializePayPal = () => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { 
                value: product.price.toString() 
              },
              description: product.title
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            alert('Payment complete! Thank you ' + details.payer.name.given_name);
          });
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          alert('Payment failed. Please try again.');
        }
      }).render('#paypal-button-container');
    }
  };

  useEffect(() => {
    // Load cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(existingCart);

    // Initialize PayPal when script loads
    if (window.paypal) {
      initializePayPal();
    } else {
      // Wait for PayPal script to load
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID';
      script.onload = initializePayPal;
      document.head.appendChild(script);
    }
  }, []);

  // Filter out internal fields from display
  const displayFields = Object.entries(product).filter(([key]) => 
    !['product_slug', 'category_slug', 'subcategory_slug', 'image_link', 'link'].includes(key)
  );

  return (
    <>
      <Head>
        <title>{product.title} - Your Store</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image_link} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="USD" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square">
              <img 
                src={product.image_link} 
                alt={product.title}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ${product.price}
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  {product.description}
                </p>
              </div>

              {/* Dynamic Product Fields */}
              <div className="space-y-3">
                {displayFields.map(([key, value]) => 
                  value && key !== 'title' && key !== 'price' && key !== 'description' ? (
                    <div key={key} className="flex">
                      <span className="font-semibold text-gray-700 capitalize min-w-24">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="ml-2 text-gray-600">{value}</span>
                    </div>
                  ) : null
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button 
                  onClick={addToCart}
                  disabled={isAddingToCart}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAddingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>

                <div className="w-full">
                  <div id="paypal-button-container"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}