import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  Container, Grid, Typography, Button, Box, IconButton,
  AppBar, Toolbar, Badge, List, ListItem, ListItemText, Divider,
  CircularProgress, Snackbar, Card, CardContent, Avatar, Alert, Paper
} from '@mui/material';
import { Add, Remove, ShoppingCart, Logout, Assessment } from '@mui/icons-material';

// Import local images in the desired sequence
import cappuccino from '../assets/products/cappuccino.jpg';
import croissant from '../assets/products/croissant.jpg';
import espresso from '../assets/products/espresso.jpg';
import coffee from '../assets/products/coffee.jpg';
import latte from '../assets/products/latte.jpg';
import muffin from '../assets/products/muffin.jpg';
import sandwich from '../assets/products/sandwich.jpg';
import tea from '../assets/products/tea.jpg';
import cake from '../assets/products/cake.jpg';
import juice from '../assets/products/juice.jpg';
import bagel from '../assets/products/bagel.jpg';
import cookie from '../assets/products/cookie.jpg';

const API_BASE_URL = 'http://localhost:5000/api';

// Define the exact sequence of products and their images
const PRODUCT_SEQUENCE = [
  { name: 'Cappuccino', image: cappuccino },
  { name: 'Croissant', image: croissant },
  { name: 'Espresso', image: espresso },
  { name: 'Coffee', image: coffee },
  { name: 'Latte', image: latte },
  { name: 'Muffin', image: muffin },
  { name: 'Sandwich', image: sandwich },
  { name: 'Tea', image: tea },
  { name: 'Cake', image: cake },
  { name: 'Juice', image: juice },
  { name: 'Bagel', image: bagel },
  { name: 'Cookie', image: cookie },
];

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Map DB products to PRODUCT_SEQUENCE
      const mappedProducts = PRODUCT_SEQUENCE.map(seq => {
        const dbProduct = res.data.find(p => p.name.toLowerCase() === seq.name.toLowerCase());
        return dbProduct
          ? { ...dbProduct, price: Number(dbProduct.price), image: seq.image }
          : { id: Math.random(), name: seq.name, price: 0, stock_quantity: 0, image: seq.image };
      });

      setProducts(mappedProducts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(i => i.product_id === product.id);
      if (found) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev =>
      prev
        .map(i => i.product_id === id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const getCartTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/orders`, {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        total_amount: getCartTotal()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCart([]);
      setSnackbar({ open: true, message: 'Order placed successfully!', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Checkout failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f0f0' }}>
      {/* Header */}
      <AppBar sx={{ bgcolor: '#6B4F4F' }}>
        <Toolbar>
          <Typography sx={{ flexGrow: 1, fontWeight: 'bold' }}>☕ Tomo's Coffee POS</Typography>
          <Typography sx={{ mr: 2 }}>Hi, {user?.username}</Typography>
          <IconButton color="inherit" onClick={() => navigate('/reports')}>
            <Assessment />
          </IconButton>
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            <Logout />
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Container */}
      <Container sx={{ mt: 8, display: 'flex', gap: 3 }}>
        {/* Big White Product Box */}
        <Paper sx={{ flex: 3, p: 4, borderRadius: 3, boxShadow: 5, bgcolor: 'white' }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {products.map((p, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card sx={{
                    width: '100%',
                    height: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: '0.3s',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
                    cursor: 'pointer',
                  }}>
                    <Box sx={{ height: 160, overflow: 'hidden' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{p.name}</Typography>
                      <Typography color="text.secondary">${p.price.toFixed(2)}</Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1, bgcolor: '#6B4F4F' }}
                        onClick={() => addToCart(p)}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Cart Box */}
        <Paper sx={{ width: 320, p: 3, borderRadius: 3, boxShadow: 5, bgcolor: '#f9f9f9', height: 'fit-content', mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your Cart</Typography>
          <Divider />
          <List sx={{ maxHeight: 600, overflowY: 'auto' }}>
            {cart.map(i => (
              <ListItem key={i.product_id}>
                <Avatar src={i.image} sx={{ mr: 1 }} />
                <ListItemText
                  primary={i.name}
                  secondary={`$${i.price.toFixed(2)} × ${i.quantity}`}
                />
                <IconButton onClick={() => removeFromCart(i.product_id)}>
                  <Remove />
                </IconButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography fontWeight="bold" sx={{ mb: 1 }}>Total: ${getCartTotal().toFixed(2)}</Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#6B4F4F' }}
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Checkout
          </Button>
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default POS;
