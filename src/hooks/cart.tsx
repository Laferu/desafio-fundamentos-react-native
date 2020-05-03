import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productList = await AsyncStorage.getItem('@Desafio:productList')

      if (productList) {
        setProducts(JSON.parse(productList))
      }


        // AsyncStorage.getAllKeys()
        //     .then(keys => AsyncStorage.multiRemove(keys))
        //     .then(() => alert('success'));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async ({ id, title, image_url, price, quantity }) => {
    // TODO ADD A NEW ITEM TO THE CART

    const productItem: Product = {
      id,
      title,
      image_url,
      price,
      quantity: quantity !== 1 ? 1 : quantity,
    }

    const productExists: Number = products.findIndex(e => e.id === productItem.id)

    const productList: Product[] = productExists !== -1
      ? products.reduce((acc: Product[], crr: Product) => {
        if (crr.id === productItem.id) {
          crr.quantity = crr.quantity + 1

        }
        acc.push(crr)
        return acc
      }, [])
      : products.length > 0
        ? [...products, productItem]
        : [productItem]

    setProducts(productList)


    await AsyncStorage.setItem('@Desafio:productList', JSON.stringify(products))
  }, [products]);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    console.log(id)

    const productExists = products.findIndex(e => e.id === id)

    if (productExists !== -1) {
      const productList = products.reduce((acc: Product[], crr: Product) => {
        if (crr.id === id) {
          crr.quantity = crr.quantity + 1
        }
        acc.push(crr)
        return acc
      }, [])

      setProducts(productList)
    }

    await AsyncStorage.setItem('@Desafio:productList', JSON.stringify(products))

  }, [products]);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART

    const productExists = products.findIndex(e => e.id === id)

    if (productExists !== -1) {
      const productList = products.reduce((acc: Product[], crr: Product) => {
        if (crr.id === id) {
          crr.quantity = crr.quantity - 1
        }
        acc.push(crr)
        return acc
      }, [])

      setProducts(productList)
    }


    await AsyncStorage.setItem('@Desafio:productList', JSON.stringify(products))

  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
