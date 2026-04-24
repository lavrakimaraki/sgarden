import { useEffect, useState } from "react";
import { Grid, Typography, Box, IconButton } from "@mui/material";
import { Star as StarIcon, StarBorder as StarBorderIcon, Download as DownloadIcon } from "@mui/icons-material";

import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { exportToCSV, exportArrayToCSV } from "../utils/csv-export.js";
import { activityAPI } from "../utils/api.js";

const availableRegions = ["Thessaloniki", "Athens", "Patras"];
const generateRandomData = (minimum = 0, maximum = 100) => {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
};

const formatNumber = (number, symbol = "", showSign = true) => {
    if (!number) return "-";

    let formattedNumber = (number > 0 && showSign) ? "+" : "";
    formattedNumber += number;
    formattedNumber += symbol;

    return formattedNumber;
};

const ExportButton = ({ chartName, onExport, testId }) => (
    <IconButton
        data-testid={testId || `export-csv-${chartName}`}
        onClick={onExport}
        sx={{ color: 'white', padding: '4px' }}
        size="small"
    >
        <DownloadIcon sx={{ fontSize: '20px' }} />
    </IconButton>
);

const Dashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
    const [data, setData] = useState({});
    const { isBookmarked, toggleBookmark } = useBookmarks();

    // Log dashboard view
    useEffect(() => {
        activityAPI.logDashboardView('/dashboard');
    }, []);

    useEffect(() => {
        const newData = {
            monthlyRevenue: {
                value: generateRandomData(),
                change: generateRandomData(-100, 100),
            },
            newCustomers: {
                value: generateRandomData(0, 10_000),
                change: generateRandomData(-100, 100),
            },
            activeSubscriptions: {
                value: generateRandomData(0, 100_000),
                change: generateRandomData(-100, 100),
            },
            weeklySales: Array.from({ length: 7 }, () => generateRandomData(0, 100)),
            revenueTrend: Array.from({ length: 12 }, () => generateRandomData(0, 500)),
            customerSatisfaction: Array.from({ length: 12 }, () => generateRandomData(0, 500)),
        };

        setData(newData);
    }, [selectedRegion]);

    return (
        <Grid container py={2} flexDirection="column">
            <Grid item style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <Typography variant="h4" gutterBottom color="white.main" sx={{ mb: 0 }}>
                    Overview
                </Typography>
                <IconButton
                    data-testid="bookmark-toggle-dashboard"
                    onClick={() => toggleBookmark('/dashboard')}
                    sx={{ color: 'white' }}
                >
                    {isBookmarked('/dashboard') ? (
                        <StarIcon data-testid="bookmark-active-dashboard" sx={{ color: 'warning.main' }} />
                    ) : (
                        <StarBorderIcon />
                    )}
                </IconButton>
            </Grid>

            <Grid item style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "20px" }}>
                <Typography variant="body1" style={{ marginRight: "10px" }} color="white.main">Region:</Typography>
                <Dropdown
                    items={availableRegions.map((region) => ({ value: region, text: region }))}
                    value={selectedRegion}
                    onChange={(event) => setSelectedRegion(event.target.value)}
                />
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Card 
                        title="Monthly Revenue"
                        titleAction={
                            <ExportButton
                                chartName="monthly-revenue"
                                onExport={() => exportToCSV([
                                    { metric: 'Monthly Revenue', value: data?.monthlyRevenue?.value || 0, change: data?.monthlyRevenue?.change || 0 }
                                ], 'monthly-revenue')}
                                testId="export-csv-monthly-revenue"
                            />
                        }
                    >
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h3" fontWeight="bold" color="secondary.main">{formatNumber(data?.monthlyRevenue?.value, "%", false)}</Typography>
                            <Grid item display="flex" flexDirection="row">
                                <Typography variant="body" color={data?.monthlyRevenue?.change > 0 ? "success.main" : "error.main"}>
                                    {formatNumber(data?.monthlyRevenue?.change, "%")}
                                </Typography>
                                <Typography variant="body" color="secondary.main" ml={1}>
                                    {"than last month"}
                                </Typography>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card 
                        title="New Customers"
                        titleAction={
                            <ExportButton
                                chartName="new-customers"
                                onExport={() => exportToCSV([
                                    { metric: 'New Customers', value: data?.newCustomers?.value || 0, change: data?.newCustomers?.change || 0 }
                                ], 'new-customers')}
                                testId="export-csv-new-customers"
                            />
                        }
                    >
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h3" fontWeight="bold" color="secondary.main">{formatNumber(data?.newCustomers?.value, "", false)}</Typography>
                            <Grid item display="flex" flexDirection="row">
                                <Typography variant="body" color={data?.newCustomers?.change > 0 ? "success.main" : "error.main"}>
                                    {formatNumber(data?.newCustomers?.change, "%")}
                                </Typography>
                                <Typography variant="body" color="secondary.main" ml={1}>
                                    {"than last month"}
                                </Typography>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card 
                        title="Active Subscriptions"
                        titleAction={
                            <ExportButton
                                chartName="active-subscriptions"
                                onExport={() => exportToCSV([
                                    { metric: 'Active Subscriptions', value: data?.activeSubscriptions?.value || 0, change: data?.activeSubscriptions?.change || 0 }
                                ], 'active-subscriptions')}
                                testId="export-csv-active-subscriptions"
                            />
                        }
                    >
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h3" fontWeight="bold" color="secondary.main">{formatNumber(data?.activeSubscriptions?.value, "", false)}</Typography>
                            <Grid item display="flex" flexDirection="row">
                                <Typography variant="body" color={data?.activeSubscriptions?.change > 0 ? "success.main" : "error.main"}>
                                    {formatNumber(data?.activeSubscriptions?.change, "%")}
                                </Typography>
                                <Typography variant="body" color="secondary.main" ml={1}>
                                    {"than last month"}
                                </Typography>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card
                        title="Weekly Sales"
                        titleAction={
                            <ExportButton
                                chartName="weekly-sales"
                                onExport={() => exportArrayToCSV(data?.weeklySales, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'weekly-sales')}
                                testId="export-csv-weekly-sales"
                            />
                        }
                        footer={(
                            <Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
                                <Typography variant="body2" component="p" sx={{ marginTop: "10px" }}>{"🕗 averages (last month)"}</Typography>
                            </Grid>
                        )}
                        footerBackgroundColor="white"
                        footerColor="gray"
                    >
                        <Plot
                            data={[
                                {
                                    x: ["M", "T", "W", "T", "F", "S", "S"],
                                    y: data?.weeklySales,
                                    type: "bar",
                                    color: "third",
                                },
                            ]}
                            showLegend={false}
                            title="Number of transactions per day"
                            titleColor="primary"
                            titleFontSize={16}
                            displayBar={false}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card
                        title="Revenue Trend"
                        titleAction={
                            <ExportButton
                                chartName="revenue-trend"
                                onExport={() => exportArrayToCSV(data?.revenueTrend, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"], 'revenue-trend')}
                                testId="export-csv-revenue-trend"
                            />
                        }
                        footer={(
                            <Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
                                <Typography variant="body2" component="p" sx={{ marginTop: "10px" }}>{"🕗 updated 4min ago"}</Typography>
                            </Grid>
                        )}
                        footerBackgroundColor="white"
                        footerColor="gray"
                    >
                        <Plot
                            data={[{
                                x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"],
                                y: data?.revenueTrend,
                                type: "lines+markers",
                                color: "third",
                            }]}
                            showLegend={false}
                            title="15% increase in revenue this month"
                            titleColor="primary"
                            titleFontSize={16}
                            displayBar={false}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card
                        title="Customer Satisfaction"
                        titleAction={
                            <ExportButton
                                chartName="customer-satisfaction"
                                onExport={() => exportArrayToCSV(data?.customerSatisfaction, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"], 'customer-satisfaction')}
                                testId="export-csv-customer-satisfaction"
                            />
                        }
                        footer={(
                            <Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
                                <Typography variant="body2" component="p" sx={{ marginTop: "10px" }}>{"🕗 just updated"}</Typography>
                            </Grid>
                        )}
                        footerBackgroundColor="white"
                        footerColor="gray"
                    >
                        <Plot
                            data={[{
                                x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"],
                                y: data?.customerSatisfaction,
                                type: "lines+markers",
                                color: "third",
                            }]}
                            showLegend={false}
                            title="Customer satisfaction score over time"
                            titleColor="primary"
                            titleFontSize={16}
                            displayBar={false}
                        />
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
