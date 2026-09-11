import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  Container, Grid, Typography, IconButton,
  AppBar, Toolbar,
  CircularProgress, Snackbar, Alert, Paper
} from '@mui/material';
import { Logout } from '@mui/icons-material';

// Import local images in the desired sequence
import cappuccino from '../assets/cappuccino.jpg';
import croissant from '../assets/croissant.jpg';
import espresso from '../assets/espresso.jpg';
import coffee from '../assets/coffee.jpg';
import latte from '../assets/latte.jpg';
import muffin from '../assets/muffin.jpg';
import sandwich from '../assets/sandwich.jpg';
import tea from '../assets/tea.jpg';
import cake from '../assets/cake.jpg';
import juice from '../assets/juice.jpg';
import bagel from '../assets/bagel.jpg';
import cookie from '../assets/cookie.jpg';

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

  const { logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            POS System
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Products
            </Typography>
            <Grid container spacing={2}>
              {products.map(pr => (
                // ... product rendering logic (unchanged)
                null
              ))}
            </Grid>
          </Paper>
        </Grid>
        {/* ... rest of component unchanged */}
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default POS;
