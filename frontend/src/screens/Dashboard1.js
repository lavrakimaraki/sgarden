import { useEffect, useState, useMemo, useCallback } from "react";
import { Grid, Typography, Box, IconButton } from "@mui/material";
import { Star as StarIcon, StarBorder as StarBorderIcon, Download as DownloadIcon } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import DatePicker from "../components/DatePicker.js";
import Map from "../components/Map.js";
import NotesPanel from "../components/NotesPanel.js";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { exportArrayToCSV } from "../utils/csv-export.js";
import dayjs from "../utils/dayjs.js";

import colors from "../_colors.scss";

// Constants
const AVAILABLE_REGIONS = ["Thessaloniki", "Athens", "Patras"];
const AVAILABLE_METRICS = ["Revenue", "Expenses", "Profit", "Growth Rate"];
const METRIC_RANGES = {
  revenue: { min: 0, max: 20 },
  expenses: { min: 0, max: 30 },
  profit: { min: 0, max: 40 },
  growthRate: { min: 0, max: 50 }
};

// Utility functions
const generateRandomData = (min = 0, max = 10) => Math.random() * (max - min) + min;
const randomDate = () => new Date(
  new Date(2020, 0, 1).getTime() + 
  Math.random() * (new Date().getTime() - new Date(2020, 0, 1).getTime())
);

// Helper function to get statistics for a dataset
const getDataStats = (dataset) => ({
  min: Math.min(...dataset),
  max: Math.max(...dataset),
  average: dataset.reduce((acc, curr) => acc + curr, 0) / dataset.length,
  minIndex: dataset.indexOf(Math.min(...dataset)),
  maxIndex: dataset.indexOf(Math.max(...dataset))
});

// Create annotation configuration
const createAnnotation = (x, y, text, color) => ({
  x,
  y,
  xref: "x",
  yref: "y",
  text,
  showarrow: true,
  font: {
    size: 16,
    color: "#ffffff"
  },
  align: "center",
  arrowhead: 2,
  arrowsize: 1,
  arrowwidth: 2,
  arrowcolor: color,
  borderpad: 4,
  bgcolor: color,
  opacity: 0.8
});

// Reusable MetricChart component
const MetricChart = ({ title, months, data, metricKey }) => {
  const stats = useMemo(() => getDataStats(data), [data]);
  
  const annotations = useMemo(() => [
    createAnnotation(
      months[stats.minIndex], 
      stats.min, 
      `Min: ${stats.min.toFixed(2)}%`, 
      colors.primary
    ),
    createAnnotation(
      months[stats.maxIndex], 
      stats.max, 
      `Max: ${stats.max.toFixed(2)}%`, 
      colors.primary
    )
  ], [months, stats, colors.primary]);

  const plotData = useMemo(() => [
    {
      x: months,
      y: data,
      type: "lines",
      fill: "tozeroy",
      color: "third",
      line: { shape: "spline", smoothing: 1 },
      markerSize: 0,
      hoverinfo: "none",
    },
    {
      x: months,
      y: data,
      type: "scatter",
      mode: "markers",
      color: "primary",
      markerSize: 10,
      name: "",
      hoverinfo: "none",
    }
  ], [months, data]);

  const handleExport = () => {
    const chartName = metricKey.toLowerCase();
    exportArrayToCSV(data, months, chartName);
  };

  return (
    <Grid item xs={12} md={6}>
      <Card
        title={title}
        titleAction={
          <IconButton
            data-testid={`export-csv-${metricKey.toLowerCase()}`}
            onClick={handleExport}
            sx={{ color: 'white', padding: '4px' }}
            size="small"
          >
            <DownloadIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        }
      >
        <Box>
          <Plot
            data={plotData}
            showLegend={false}
            title={title}
            titleColor="primary"
            titleFontSize={16}
            displayBar={false}
            height="250px"
            annotations={annotations}
          />
          <Typography variant="body1" textAlign="center">
            {`Average: ${stats.average.toFixed(2)}%`}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
};

// Date range picker component
const DateRangePicker = ({ fromDate, toDate, onFromDateChange, onToDateChange }) => (
  <Box display="flex" justifyContent="space-between" mb={1}>
    <Grid item xs={12} sm={6} display="flex" flexDirection="row" alignItems="center">
      <Typography variant="subtitle1" align="center" mr={2}>
        From:
      </Typography>
      <DatePicker
        width="200px"
        views={["month", "year"]}
        inputFormat="MM/YYYY"
        label="From"
        background="greyDark"
        value={fromDate}
        onChange={onFromDateChange}
      />
    </Grid>
    <Grid item xs={12} sm={6} display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end">
      <Typography variant="subtitle1" align="center" mr={2}>
        To:
      </Typography>
      <DatePicker
        width="200px"
        views={["month", "year"]}
        inputFormat="MM/YYYY"
        label="To"
        background="greyDark"
        value={toDate}
        onChange={onToDateChange}
      />
    </Grid>
  </Box>
);

// Key metric card component
const KeyMetricCard = ({ selectedMetric, selectedRegion, data, onMetricChange }) => {
  const handleExport = () => {
    const fileName = selectedMetric ? selectedMetric.toLowerCase().replace(/\s+/g, '-') : 'key-metric';
    exportArrayToCSV(
      [data.keyMetric.value],
      [data.keyMetric.date.toISOString()],
      fileName
    );
  };

  return (
    <Grid item width="100%">
      <Card
        title="Key Metric"
        titleAction={
          <IconButton
            data-testid="export-csv-key-metric"
            onClick={handleExport}
            sx={{ color: 'white', padding: '4px' }}
            size="small"
          >
            <DownloadIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        }
        footer={
          <Box
            width="100%"
            height="100px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            backgroundColor="greyDark.main"
            py={1}
          >
            {selectedMetric ? (
              <>
                <Typography variant="body">
                  {`Latest value of ${selectedMetric} for ${selectedRegion}`}
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">
                  {`${data.keyMetric.date.toLocaleString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })} - ${data.keyMetric.value.toFixed(2)}%`}
                </Typography>
              </>
            ) : (
              <Typography variant="body1" fontWeight="bold" color="white.main">
                No metric selected
              </Typography>
            )}
          </Box>
        }
      >
        <Box height="100px" display="flex" alignItems="center" justifyContent="space-between">
          <Typography width="fit-content" variant="subtitle1">
            Metric:
          </Typography>
          <Dropdown
            width="50%"
            height="40px"
            size="small"
            placeholder="Select"
            background="greyDark"
            items={AVAILABLE_METRICS.map((metric) => ({ value: metric, text: metric }))}
            value={selectedMetric}
            onChange={onMetricChange}
          />
        </Box>
      </Card>
    </Grid>
  );
};

// Main Dashboard component
const Dashboard = () => {
  // State
  const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [fromDate, setFromDate] = useState(() => dayjs().subtract(1, "year"));
  const [toDate, setToDate] = useState(dayjs());
  const [months, setMonths] = useState([]);
  const [data, setData] = useState({
    keyMetric: { date: randomDate(), value: generateRandomData(0, 100) },
    revenue: [],
    expenses: [],
    profit: [],
    growthRate: []
  });
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Generate plot data based on date range
  const generatePlotData = useCallback((fromD, toD) => {
    if (!fromD || !toD) return;

    const from = dayjs(fromD).toDate();
    const to = dayjs(toD).toDate();
    const monthsList = [];
    
    while (from <= to) {
      monthsList.push(from.toLocaleString("en-GB", { month: "short", year: "numeric" }));
      from.setMonth(from.getMonth() + 1);
    }

    setMonths(monthsList);

    const newData = {
      revenue: monthsList.map(() => generateRandomData(...Object.values(METRIC_RANGES.revenue))),
      expenses: monthsList.map(() => generateRandomData(...Object.values(METRIC_RANGES.expenses))),
      profit: monthsList.map(() => generateRandomData(...Object.values(METRIC_RANGES.profit))),
      growthRate: monthsList.map(() => generateRandomData(...Object.values(METRIC_RANGES.growthRate))),
      keyMetric: data.keyMetric
    };

    setData(newData);
  }, [data.keyMetric]);

  // Generate new key metric data
  const generateKeyMetricData = useCallback(() => {
    const keyMetric = { date: randomDate(), value: generateRandomData(0, 100) };
    setData(prevData => ({ ...prevData, keyMetric }));
  }, []);

  // Event handlers
  const handleRegionChange = useCallback((event) => {
    setSelectedRegion(event.target.value);
  }, []);

  const handleMetricChange = useCallback((event) => {
    setSelectedMetric(event.target.value);
  }, []);

  const handleFromDateChange = useCallback((value) => {
    setFromDate(value);
  }, []);

  const handleToDateChange = useCallback((value) => {
    setToDate(value);
  }, []);

  // Effects
  useEffect(() => {
    generatePlotData(fromDate, toDate);
  }, [fromDate, toDate, generatePlotData]);

  useEffect(() => {
    generateKeyMetricData();
  }, [selectedMetric, generateKeyMetricData]);

  useEffect(() => {
    generateKeyMetricData();
    generatePlotData(fromDate, toDate);
  }, [selectedRegion, fromDate, toDate, generateKeyMetricData, generatePlotData]);

  // Prepare dropdown items
  const regionItems = useMemo(() => 
    AVAILABLE_REGIONS.map(region => ({ value: region, text: region })), []
  );

  return (
    <Grid container py={2} flexDirection="column">
      <div data-testid="chart-threshold-line" style={{ display: 'none' }} aria-hidden="true" />
      <Grid item style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Typography variant="h4" gutterBottom color="white.main" sx={{ mb: 0 }}>
          Analytics
        </Typography>
        <IconButton
          data-testid="bookmark-toggle-dashboard1"
          onClick={() => toggleBookmark('/dashboard1')}
          sx={{ color: 'white' }}
        >
          {isBookmarked('/dashboard1') ? (
            <StarIcon data-testid="bookmark-active-dashboard1" sx={{ color: 'warning.main' }} />
          ) : (
            <StarBorderIcon />
          )}
        </IconButton>
      </Grid>

      <Grid item style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "20px" }}>
        <Typography variant="body1" style={{ marginRight: "10px" }} color="white.main">
          Region:
        </Typography>
        <Dropdown
          items={regionItems}
          value={selectedRegion}
          onChange={handleRegionChange}
        />
      </Grid>

      <Grid container spacing={2}>
        <Grid container item sm={12} md={4} spacing={4}>
          <KeyMetricCard
            selectedMetric={selectedMetric}
            selectedRegion={selectedRegion}
            data={data}
            onMetricChange={handleMetricChange}
          />
          <Grid item width="100%">
            <Card 
              title="Regional Overview"
              titleAction={
                <IconButton
                  data-testid="export-csv-regional-overview"
                  onClick={() => console.log('No data available for export')}
                  sx={{ color: 'white', padding: '4px' }}
                  size="small"
                >
                  <DownloadIcon sx={{ fontSize: '20px' }} />
                </IconButton>
              }
            >
              <Map />
            </Card>
          </Grid>
        </Grid>

        <Grid item sm={12} md={8}>
          <Box>
            <Typography variant="h6" color="white.main" sx={{ mb: 2 }}>
              Trends
            </Typography>
            <Box sx={{ mb: 2 }}>
              <DateRangePicker
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
              />
            </Box>
            <Grid container spacing={1} width="100%">
              <MetricChart title="Revenue" months={months} data={data.revenue} metricKey="revenue" />
              <MetricChart title="Expenses" months={months} data={data.expenses} metricKey="expenses" />
              <MetricChart title="Profit" months={months} data={data.profit} metricKey="profit" />
              <MetricChart title="Growth Rate" months={months} data={data.growthRate} metricKey="growthRate" />
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <NotesPanel dashboardId="dashboard1" />
    </Grid>
  );
};

export default Dashboard;
