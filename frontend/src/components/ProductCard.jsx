import React from 'react';
const cappuccino = 'https://via.placeholder.com/300x200?text=Cappuccino';
import latte from '../assets/products/latte.jpg';
import espresso from '../assets/products/espresso.jpg';

const products = [
  { name: 'Cappuccino', image: cappuccino },
  { name: 'Latte', image: latte },
  { name: 'Espresso', image: espresso },
];

export default function ProductList() {
  return (
    <div>
      {products.map(p => (
        <div key={p.name}>
          <img src={p.image} alt={p.name} />
          <p>{p.name}</p>
        </div>
      ))}
    </div>
  );
}
