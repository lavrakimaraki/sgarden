import { useEffect, useState } from "react";
import { Grid, Typography, IconButton } from "@mui/material";
import { Star as StarIcon, StarBorder as StarBorderIcon, Download as DownloadIcon } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import NotesPanel from "../components/NotesPanel.js";
import ComparisonMode from "../components/ComparisonMode.js";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { exportToCSV, exportArrayToCSV } from "../utils/csv-export.js";

import { getData } from "../api/index.js";

const availableRegions = ["Thessaloniki", "Athens", "Patras"];

const Dashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
    const [data, setData] = useState({ quarterlySalesDistribution: {}, budgetVsActual: {}, timePlot: {} });
    const { isBookmarked, toggleBookmark } = useBookmarks();

    useEffect(() => {
        getData().then((tempData) => {
            const { success, quarterlySalesDistribution, budgetVsActual, timePlot } = tempData;

            if (success) {
                setData({ quarterlySalesDistribution, budgetVsActual, timePlot });
            }
        });
    }, [selectedRegion]);

    return (
        <Grid container py={2} flexDirection="column">
            <Grid item style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <Typography variant="h4" gutterBottom color="white.main" sx={{ mb: 0 }}>
                    Insights
                </Typography>
                <IconButton
                    data-testid="bookmark-toggle-dashboard2"
                    onClick={() => toggleBookmark('/dashboard2')}
                    sx={{ color: 'white' }}
                >
                    {isBookmarked('/dashboard2') ? (
                        <StarIcon data-testid="bookmark-active-dashboard2" sx={{ color: 'warning.main' }} />
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
           <Grid item>
                 <ComparisonMode />
            </Grid>
            <Grid container spacing={2}>
                <Grid item sm={12} md={6}>
                    <Card 
                        title="Quarterly Sales Distribution"
                        titleAction={
                            <IconButton
                                data-testid="export-csv-quarterly-sales"
                                onClick={() => {
                                    const quarterlySalesData = [
                                        { quarter: 'Q1', values: JSON.stringify(data?.quarterlySalesDistribution?.Q1) },
                                        { quarter: 'Q2', values: JSON.stringify(data?.quarterlySalesDistribution?.Q2) },
                                        { quarter: 'Q3', values: JSON.stringify(data?.quarterlySalesDistribution?.Q3) },
                                    ];
                                    exportToCSV(quarterlySalesData, 'quarterly-sales-distribution');
                                }}
                                sx={{ color: 'white', padding: '4px' }}
                                size="small"
                            >
                                <DownloadIcon sx={{ fontSize: '20px' }} />
                            </IconButton>
                        }
                    >
                        <Plot
                            data={[
                                {
                                    title: "Q1",
                                    y: data?.quarterlySalesDistribution?.Q1,
                                    type: "box",
                                    color: "primary",
                                },
                                {
                                    title: "Q2",
                                    y: data?.quarterlySalesDistribution?.Q2,
                                    type: "box",
                                    color: "secondary",
                                },
                                {
                                    title: "Q3",
                                    y: data?.quarterlySalesDistribution?.Q3,
                                    type: "box",
                                    color: "third",
                                },
                            ]}
                            showLegend={false}
                            displayBar={false}
                            height="300px"
                            marginBottom="40"
                        />
                    </Card>
                </Grid>
                <Grid item sm={12} md={6}>
                    <Card 
                        title="Budget vs Actual Spending"
                        titleAction={
                            <IconButton
                                data-testid="export-csv-budget-vs-actual"
                                onClick={() => {
                                    const budgetData = Object.entries(data?.budgetVsActual || {}).map(([month, values]) => ({
                                        month,
                                        budget: values.budget,
                                        actual: values.actual,
                                        forecast: values.forecast,
                                    }));
                                    exportToCSV(budgetData, 'budget-vs-actual-spending');
                                }}
                                sx={{ color: 'white', padding: '4px' }}
                                size="small"
                            >
                                <DownloadIcon sx={{ fontSize: '20px' }} />
                            </IconButton>
                        }
                    >
                        <Plot
                            data={[
                                {
                                    x: ["January", "February", "March", "April", "May", "June"],
                                    y: Object.values(data?.budgetVsActual).map(month => month.budget),
                                    type: "bar",
                                    color: "primary",
                                    title: "Budget",
                                },
                                {
                                    x: ["January", "February", "March", "April", "May", "June"],
                                    y: Object.values(data?.budgetVsActual).map(month => month.actual),
                                    type: "bar",
                                    color: "secondary",
                                    title: "Actual",
                                },
                                {
                                    x: ["January", "February", "March", "April", "May", "June"],
                                    y: Object.values(data?.budgetVsActual).map(month => month.forecast),
                                    type: "bar",
                                    color: "third",
                                    title: "Forecast",
                                },
                            ]}
                            showLegend={true}
                            displayBar={false}
                            height="300px"
                            marginBottom="40"
                        />
                    </Card>
                </Grid>
                <Grid item sm={12}>
                    <Card 
                        title="Performance Over Time"
                        titleAction={
                            <IconButton
                                data-testid="export-csv-performance"
                                onClick={() => {
                                    const performanceData = Array.from({ length: 20 }, (_, i) => ({
                                        period: i + 1,
                                        projected: data?.timePlot?.projected?.[i] || 0,
                                        actual: data?.timePlot?.actual?.[i] || 0,
                                        historicalAvg: data?.timePlot?.historicalAvg?.[i] || 0,
                                    }));
                                    exportToCSV(performanceData, 'performance-over-time');
                                }}
                                sx={{ color: 'white', padding: '4px' }}
                                size="small"
                            >
                                <DownloadIcon sx={{ fontSize: '20px' }} />
                            </IconButton>
                        }
                    >
                        <Plot
                            data={[
                                {
                                    title: "Projected",
                                    x: Array.from({ length: 20 }, (_, i) => i + 1),
                                    y: data?.timePlot?.projected,
                                    type: "line",
                                    color: "primary",
                                },
                                {
                                    title: "Actual",
                                    x: Array.from({ length: 20 }, (_, i) => i + 1),
                                    y: data?.timePlot?.actual,
                                    type: "line",
                                    color: "secondary",
                                },
                                {
                                    title: "Historical Avg",
                                    x: Array.from({ length: 20 }, (_, i) => i + 1),
                                    y: data?.timePlot?.historicalAvg,
                                    type: "line",
                                    color: "third",
                                },
                            ]}
                            showLegend={true}
                            displayBar={false}
                            height="300px"
                            marginBottom="40"
                        />
                    </Card>
                </Grid>
            </Grid>
            <NotesPanel dashboardId="dashboard2" />
        </Grid>
    );
};

export default Dashboard;
