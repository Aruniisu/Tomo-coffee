import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

// Placeholder image URL used because the original '../assets/products/cappuccino.jpg' file is missing.
const placeholderImg = 'https://via.placeholder.com/300x200?text=Cappuccino';

function Products() {
  const products = [
    { name: 'Cappuccino', img: placeholderImg, price: 3.5 },
    // Add other products here as needed.
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {products.map((p) => (
        <Card key={p.name} sx={{ width: 300 }}>
          <CardMedia component="img" height="200" image={p.img} alt={p.name} />
          <CardContent>
            <Typography variant="h6">{p.name}</Typography>
            <Typography variant="body2">${p.price}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Products;
