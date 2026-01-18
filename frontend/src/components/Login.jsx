import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            
            login(response.data.token, { username: response.data.username });
            navigate('/pos');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: '100%',
                        maxWidth: 400,
                        textAlign: 'center',
                    }}
                >
                    {/* Logo/Header */}
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#6B4F4F' }}>
                        Tomo's Coffee
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mb: 4, color: '#666' }}>
                        Point of Sale System
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                backgroundColor: '#6B4F4F',
                                '&:hover': {
                                    backgroundColor: '#5A3F3F',
                                },
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>

                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 2, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => alert('Contact administrator to reset password')}
                        >
                            Forgot Password?
                        </Typography>
                    </form>

                    {/* Demo credentials */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            Demo Credentials:
                        </Typography>
                        <Typography variant="body2">
                            Username: cashier
                        </Typography>
                        <Typography variant="body2">
                            Password: password123
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;