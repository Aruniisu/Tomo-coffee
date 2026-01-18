import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    IconButton,
    AppBar,
    Toolbar,
    Badge,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Avatar,
} from '@mui/material';
import { Add, Remove, ShoppingCart, Logout, Assessment, Refresh } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:5000/api';

// Product images mapping
const PRODUCT_IMAGES = {
    'Cappuccino': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
    'Croissant': 'https://images.unsplash.com/photo-1555507036-ab794f27d2e9?w=400&h=300&fit=crop',
    'Espresso': 'https://images.unsplash.com/photo-1510707577719-ae7c9b788690?w=400&h=300&fit=crop',
    'Coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    'Chocolate': 'https://images.unsplash.com/photo-1570913199992-91d07c140e7a?w=400&h=300&fit=crop',
    'Yagvri': 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop',
    'Yagvri Tea': 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop',
    'Peppermint Tea': 'https://images.unsplash.com/photo-1563414761752-7c2f8a6c7b7c?w=400&h=300&fit=crop',
    'Chocolate Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    'Muffin': 'https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?w=400&h=300&fit=crop',
    'Bagel': 'https://images.unsplash.com/photo-1551773477-8c3c7e8e1e6e?w=400&h=300&fit=crop',
    'Sandwich': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop'
};

const POS = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/products`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && Array.isArray(response.data)) {
                // Add images to products
                const productsWithImages = response.data.map(product => ({
                    ...product,
                    image: PRODUCT_IMAGES[product.name] || PRODUCT_IMAGES.default
                }));
                setProducts(productsWithImages);
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Using demo products.');
            
            // Demo products with images
            const demoProducts = [
                { id: 1, name: 'Cappuccino', price: 4.50, stock_quantity: 50, image: PRODUCT_IMAGES['Cappuccino'] },
                { id: 2, name: 'Croissant', price: 3.00, stock_quantity: 30, image: PRODUCT_IMAGES['Croissant'] },
                { id: 3, name: 'Espresso', price: 4.50, stock_quantity: 40, image: PRODUCT_IMAGES['Espresso'] },
                { id: 4, name: 'Coffee', price: 2.50, stock_quantity: 60, image: PRODUCT_IMAGES['Coffee'] },
                { id: 5, name: 'Chocolate', price: 2.50, stock_quantity: 25, image: PRODUCT_IMAGES['Chocolate'] },
                { id: 6, name: 'Yagvri Tea', price: 3.00, stock_quantity: 20, image: PRODUCT_IMAGES['Yagvri Tea'] },
                { id: 7, name: 'Peppermint Tea', price: 2.00, stock_quantity: 35, image: PRODUCT_IMAGES['Peppermint Tea'] },
                { id: 8, name: 'Chocolate Cake', price: 4.00, stock_quantity: 15, image: PRODUCT_IMAGES['Chocolate Cake'] },
                { id: 9, name: 'Muffin', price: 3.50, stock_quantity: 20, image: PRODUCT_IMAGES['Muffin'] },
                { id: 10, name: 'Bagel', price: 3.50, stock_quantity: 25, image: PRODUCT_IMAGES['Bagel'] },
                { id: 11, name: 'Sandwich', price: 7.50, stock_quantity: 20, image: PRODUCT_IMAGES['Sandwich'] },
                { id: 12, name: 'Salad', price: 9.00, stock_quantity: 15, image: PRODUCT_IMAGES['Salad'] },
            ];
            setProducts(demoProducts);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stock_quantity <= 0) {
            setSnackbar({
                open: true,
                message: `${product.name} is out of stock!`,
                severity: 'warning'
            });
            return;
        }
        
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product_id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock_quantity) {
                    setSnackbar({
                        open: true,
                        message: `Only ${product.stock_quantity} ${product.name} available!`,
                        severity: 'warning'
                    });
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, {
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                }];
            }
        });
        
        setSnackbar({
            open: true,
            message: `Added ${product.name} to cart`,
            severity: 'success'
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product_id === productId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                return prevCart.filter(item => item.product_id !== productId);
            }
        });
        
        setSnackbar({
            open: true,
            message: 'Item removed from cart',
            severity: 'info'
        });
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setSnackbar({
                open: true,
                message: 'Cart is empty!',
                severity: 'warning'
            });
            return;
        }

        const total = getCartTotal();
        if (!window.confirm(`Confirm order for $${total.toFixed(2)}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                })),
                total_amount: total
            };

            await axios.post(`${API_BASE_URL}/orders`, orderData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setSnackbar({
                open: true,
                message: 'Order placed successfully!',
                severity: 'success'
            });
            
            setCart([]);
            fetchProducts();
            
        } catch (error) {
            console.error('Error:', error);
            setSnackbar({
                open: true,
                message: 'Order simulated successfully!',
                severity: 'info'
            });
            
            // Update stock locally
            const updatedProducts = products.map(product => {
                const cartItem = cart.find(item => item.product_id === product.id);
                if (cartItem) {
                    return {
                        ...product,
                        stock_quantity: Math.max(0, product.stock_quantity - cartItem.quantity)
                    };
                }
                return product;
            });
            setProducts(updatedProducts);
            setCart([]);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const goToReports = () => {
        navigate('/reports');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm('Clear cart?')) {
            setCart([]);
            setSnackbar({
                open: true,
                message: 'Cart cleared',
                severity: 'info'
            });
        }
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Header */}
            <AppBar position="static" sx={{ bgcolor: '#6B4F4F' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        ☕ Tomo's Coffee POS
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
                        Welcome, {user?.username || 'Cashier'}!
                    </Typography>
                    <IconButton color="inherit" onClick={goToReports} title="Reports">
                        <Assessment />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogout} title="Logout">
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
                <Grid container spacing={2}>
                    {/* Products Grid - Left Side */}
                    <Grid item xs={12} md={9}>
                        <Paper sx={{ p: 2, height: 'calc(100vh - 150px)', overflow: 'auto', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" sx={{ color: '#6B4F4F', fontWeight: 'bold' }}>
                                    Available Products
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<Refresh />}
                                    onClick={fetchProducts}
                                    disabled={loading}
                                    sx={{ color: '#6B4F4F', borderColor: '#6B4F4F' }}
                                >
                                    Refresh
                                </Button>
                            </Box>
                            
                            {error && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            
                            {loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                                    <CircularProgress size={60} sx={{ color: '#6B4F4F', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#6B4F4F' }}>
                                        Loading products...
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {products.map(product => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                            <Card 
                                                sx={{ 
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    cursor: product.stock_quantity > 0 ? 'pointer' : 'default',
                                                    '&:hover': { 
                                                        boxShadow: product.stock_quantity > 0 ? 4 : 1,
                                                    },
                                                    opacity: product.stock_quantity === 0 ? 0.6 : 1,
                                                }}
                                                onClick={() => product.stock_quantity > 0 && addToCart(product)}
                                            >
                                                {/* Product Image */}
                                                <Box sx={{ height: 140, overflow: 'hidden' }}>
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name}
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            objectFit: 'cover' 
                                                        }}
                                                    />
                                                </Box>
                                                
                                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                        {product.name}
                                                    </Typography>
                                                    
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box>
                                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                                ${product.price?.toFixed(2)}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                Stock: {product.stock_quantity}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    
                                                    {product.stock_quantity === 0 && (
                                                        <Chip 
                                                            label="Out of Stock" 
                                                            size="small" 
                                                            color="error" 
                                                            sx={{ mt: 1 }} 
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>
                    </Grid>

                    {/* Cart Sidebar - Right Side */}
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ 
                            p: 2, 
                            height: 'calc(100vh - 150px)', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 2,
                            border: '2px solid #6B4F4F'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ShoppingCart sx={{ mr: 1, color: '#6B4F4F' }} />
                                <Typography variant="h6" sx={{ color: '#6B4F4F', fontWeight: 'bold', flexGrow: 1 }}>
                                    Current Order
                                </Typography>
                                <Badge 
                                    badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} 
                                    color="primary" 
                                    sx={{ 
                                        '& .MuiBadge-badge': { 
                                            bgcolor: '#6B4F4F',
                                        } 
                                    }} 
                                />
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                                {cart.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                                        <ShoppingCart sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                        <Typography variant="body1" color="textSecondary">
                                            Your cart is empty
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {cart.map((item, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ 
                                                    p: 1,
                                                    mb: 1,
                                                    bgcolor: '#f9f9f9',
                                                    borderRadius: 1
                                                }}
                                                secondaryAction={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFromCart(item.product_id)}
                                                            sx={{ color: '#ff4444' }}
                                                        >
                                                            <Remove fontSize="small" />
                                                        </IconButton>
                                                        <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const product = products.find(p => p.id === item.product_id);
                                                                if (product) addToCart(product);
                                                            }}
                                                            sx={{ color: '#6B4F4F' }}
                                                        >
                                                            <Add fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                }
                                            >
                                                {/* Cart item image */}
                                                <Avatar 
                                                    src={item.image} 
                                                    sx={{ 
                                                        width: 40, 
                                                        height: 40, 
                                                        mr: 2,
                                                        border: '2px solid #6B4F4F'
                                                    }}
                                                />
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {item.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" color="textSecondary">
                                                            ${item.price.toFixed(2)} × {item.quantity}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>

                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Subtotal:</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            ${getCartTotal().toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Tax (10%):</Typography>
                                        <Typography variant="body2">
                                            ${(getCartTotal() * 0.1).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ color: '#6B4F4F' }}>Total:</Typography>
                                        <Typography variant="h6" sx={{ color: '#6B4F4F', fontWeight: 'bold' }}>
                                            ${(getCartTotal() * 1.1).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {cart.length > 0 && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={clearCart}
                                            sx={{
                                                color: '#ff4444',
                                                borderColor: '#ff4444'
                                            }}
                                        >
                                            Clear Cart
                                        </Button>
                                    )}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleCheckout}
                                        disabled={cart.length === 0}
                                        sx={{
                                            bgcolor: '#6B4F4F',
                                            '&:hover': { bgcolor: '#5A3F3F' },
                                            py: 1.5,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        CHECKOUT (${(getCartTotal() * 1.1).toFixed(2)})
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default POS;