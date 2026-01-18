import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    Card,
    CardContent,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowBack, DateRange } from '@mui/icons-material';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000/api';

const Reports = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [salesData, setSalesData] = useState(null);
    const [profitData, setProfitData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const [salesRes, profitRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/reports/daily_sales`, {
                    params: { date: selectedDate },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/reports/daily_profit`, {
                    params: { date: selectedDate },
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSalesData(salesRes.data);
            setProfitData(profitRes.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleGenerateReport = () => {
        fetchReports();
    };

    const goBackToPOS = () => {
        navigate('/pos');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Prepare chart data
    const chartData = salesData && profitData ? [
        {
            name: 'Sales',
            value: salesData.total_sales,
            fill: '#8884d8'
        },
        {
            name: 'Profit',
            value: profitData.total_profit,
            fill: '#82ca9d'
        }
    ] : [];

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Header */}
            <AppBar position="static" sx={{ bgcolor: '#6B4F4F' }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={goBackToPOS} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Tomo's Coffee - Daily Reports
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Date Selection */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DateRange sx={{ mr: 1 }} />
                        <Typography variant="h6">Select Date</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleGenerateReport}
                            disabled={loading}
                            sx={{
                                bgcolor: '#6B4F4F',
                                '&:hover': { bgcolor: '#5A3F3F' }
                            }}
                        >
                            {loading ? 'Loading...' : 'Generate Report'}
                        </Button>
                    </Box>
                </Paper>

                {/* Report Content */}
                {salesData && profitData && (
                    <Grid container spacing={3}>
                        {/* Summary Cards */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Date
                                    </Typography>
                                    <Typography variant="h5">
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Sales
                                    </Typography>
                                    <Typography variant="h4" color="primary">
                                        ${salesData.total_sales.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Profit
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        ${profitData.total_profit.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Chart */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Sales vs Profit Comparison
                                </Typography>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis 
                                                tickFormatter={(value) => `$${value.toFixed(2)}`}
                                            />
                                            <Tooltip 
                                                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Detailed Breakdown */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Detailed Breakdown
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Revenue Details
                                            </Typography>
                                            <Typography variant="body2">
                                                Total Revenue: ${profitData.total_revenue.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Total Cost: ${profitData.total_cost.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Profit Margin: {((profitData.total_profit / profitData.total_revenue) * 100 || 0).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Performance Summary
                                            </Typography>
                                            <Typography variant="body2">
                                                Date: {selectedDate}
                                            </Typography>
                                            <Typography variant="body2">
                                                Report Generated: {new Date().toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2">
                                                Status: {profitData.total_profit > 0 ? 'Profitable' : 'No Profit'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Empty State */}
                {!salesData && !profitData && !loading && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Select a date and click "Generate Report" to view daily reports
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
};

export default Reports;