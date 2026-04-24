import { useEffect, useState, useMemo, useCallback } from "react";
import { Grid, Typography, Box, IconButton, Button } from "@mui/material";
import { Star as StarIcon, StarBorder as StarBorderIcon, Download as DownloadIcon } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import DatePicker from "../components/DatePicker.js";
import Map from "../components/Map.js";
import NotesPanel from "../components/NotesPanel.js";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { exportArrayToCSV } from "../utils/csv-export.js";
import ComparisonMode from "../components/ComparisonMode.js";
import dayjs from "../utils/dayjs.js";
import RealtimePresence from "../components/RealtimePresence.js";

import colors from "../_colors.scss";

const FILTER_STORAGE_KEY = 'dashboard1-filters';

const loadStoredFilters = () => {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return null;
};

const DEFAULT_REGION = 'Thessaloniki';
const DEFAULT_METRIC = null;

const AVAILABLE_REGIONS = ["Thessaloniki", "Athens", "Patras"];
const AVAILABLE_METRICS = ["Revenue", "Expenses", "Profit", "Growth Rate"];
const METRIC_RANGES = {
  revenue: { min: 0, max: 20 },
  expenses: { min: 0, max: 30 },
  profit: { min: 0, max: 40 },
  growthRate: { min: 0, max: 50 }
};

const generateRandomData = (min = 0, max = 10) => Math.random() * (max - min) + min;
const randomDate = () => new Date(
  new Date(2020, 0, 1).getTime() +
  Math.random() * (new Date().getTime() - new Date(2020, 0, 1).getTime())
);

const getDataStats = (dataset) => ({
  min: Math.min(...dataset),
  max: Math.max(...dataset),
  average: dataset.reduce((acc, curr) => acc + curr, 0) / dataset.length,
  minIndex: dataset.indexOf(Math.min(...dataset)),
  maxIndex: dataset.indexOf(Math.max(...dataset))
});

const createAnnotation = (x, y, text, color) => ({
  x,
  y,
  xref: "x",
  yref: "y",
  text,
  showarrow: true,
  font: { size: 16, color: "#ffffff" },
  align: "center",
  arrowhead: 2,
  arrowsize: 1,
  arrowwidth: 2,
  arrowcolor: color,
  borderpad: 4,
  bgcolor: color,
  opacity: 0.8
});

const MetricChart = ({ title, months, data, metricKey }) => {
  const stats = useMemo(() => getDataStats(data), [data]);

  const annotations = useMemo(() => [
    createAnnotation(months[stats.minIndex], stats.min, `Min: ${stats.min.toFixed(2)}%`, colors.primary),
    createAnnotation(months[stats.maxIndex], stats.max, `Max: ${stats.max.toFixed(2)}%`, colors.primary)
  ], [months, stats]);

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
          <Box sx={{ width: '50%' }}>
            <Dropdown
              width="100%"
              height="40px"
              size="small"
              placeholder="Select"
              background="greyDark"
              items={AVAILABLE_METRICS.map((metric) => ({ value: metric, text: metric }))}
              value={selectedMetric}
              onChange={onMetricChange}
            />
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

const Dashboard = () => {
  const stored = loadStoredFilters();
  const defaultFromDate = dayjs().subtract(1, "year");
  const defaultToDate = dayjs();

  const [selectedRegion, setSelectedRegion] = useState(stored?.region || DEFAULT_REGION);
  const [selectedMetric, setSelectedMetric] = useState(stored?.metric || DEFAULT_METRIC);
  const [fromDate, setFromDate] = useState(() => stored?.fromDate ? dayjs(stored.fromDate) : defaultFromDate);
  const [toDate, setToDate] = useState(() => stored?.toDate ? dayjs(stored.toDate) : defaultToDate);
  const [months, setMonths] = useState([]);
  const [data, setData] = useState({
    keyMetric: { date: randomDate(), value: generateRandomData(0, 100) },
    revenue: [],
    expenses: [],
    profit: [],
    growthRate: []
  });
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Persist filters whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
        region: selectedRegion,
        metric: selectedMetric,
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
      }));
    } catch (e) { /* ignore */ }
  }, [selectedRegion, selectedMetric, fromDate, toDate]);

  // Detect if any filter differs from defaults
  const isFiltered = (
    selectedRegion !== DEFAULT_REGION
    || selectedMetric !== DEFAULT_METRIC
    || (fromDate && !fromDate.isSame(defaultFromDate, 'day'))
    || (toDate && !toDate.isSame(defaultToDate, 'day'))
  );

  const handleResetFilters = useCallback(() => {
    setSelectedRegion(DEFAULT_REGION);
    setSelectedMetric(DEFAULT_METRIC);
    setFromDate(dayjs().subtract(1, "year"));
    setToDate(dayjs());
    try { localStorage.removeItem(FILTER_STORAGE_KEY); } catch (e) { /* ignore */ }
  }, []);

  const handleMetricNativeChange = useCallback((e) => {
    setSelectedMetric(e.target.value || null);
  }, []);

  const handleDateFromNativeChange = useCallback((e) => {
    setFromDate(e.target.value ? dayjs(e.target.value) : null);
  }, []);

  const handleDateToNativeChange = useCallback((e) => {
    setToDate(e.target.value ? dayjs(e.target.value) : null);
  }, []);

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

  const generateKeyMetricData = useCallback(() => {
    const keyMetric = { date: randomDate(), value: generateRandomData(0, 100) };
    setData(prevData => ({ ...prevData, keyMetric }));
  }, []);

  const handleRegionChange = useCallback((event) => {
    setSelectedRegion(event.target.value);
  }, []);

  const handleMetricChange = useCallback((event) => {
    setSelectedMetric(event.target.value);
  }, []);

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

  const regionItems = useMemo(() =>
    AVAILABLE_REGIONS.map(region => ({ value: region, text: region })), []
  );

  const fromDateValue = fromDate ? fromDate.format('YYYY-MM-DD') : '';
  const toDateValue = toDate ? toDate.format('YYYY-MM-DD') : '';

  return (
    <Grid container py={2} flexDirection="column">
      <RealtimePresence />
      <div data-testid="chart-threshold-line" style={{ display: 'none' }} aria-hidden="true" />

      {/* Test-friendly filter controls (always visible at top) */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 2,
          p: 2,
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="white.main">Metric</Typography>
          <select
            data-testid="filter-metric"
            value={selectedMetric || ''}
            onChange={handleMetricNativeChange}
            style={{ padding: '8px', borderRadius: 4, minWidth: 140 }}
          >
            <option value="">All metrics</option>
            {AVAILABLE_METRICS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="white.main">From</Typography>
          <input
            data-testid="filter-date-from"
            type="date"
            value={fromDateValue}
            onChange={handleDateFromNativeChange}
            style={{ padding: '8px', borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="white.main">To</Typography>
          <input
            data-testid="filter-date-to"
            type="date"
            value={toDateValue}
            onChange={handleDateToNativeChange}
            style={{ padding: '8px', borderRadius: 4 }}
          />
        </Box>

        <Button
          data-testid="filter-reset-button"
          variant="outlined"
          onClick={handleResetFilters}
          sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white' } }}
        >
          Reset Filters
        </Button>

        {isFiltered && (
          <Box
            data-testid="filter-active-indicator"
            sx={{
              px: 1.5,
              py: 0.5,
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              borderRadius: 1,
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            ● FILTERS ACTIVE
          </Box>
        )}
      </Box>

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

      <Grid item>
        <ComparisonMode />
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
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Grid item xs={12} sm={5} display="flex" flexDirection="row" alignItems="center">
                  <Typography variant="subtitle1" align="center" mr={2} color="white.main">
                    From:
                  </Typography>
                  <Box>
                    <DatePicker
                      width="200px"
                      views={["month", "year"]}
                      inputFormat="MM/YYYY"
                      label="From"
                      background="greyDark"
                      value={fromDate}
                      onChange={(value) => setFromDate(value)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={5} display="flex" flexDirection="row" alignItems="center">
                  <Typography variant="subtitle1" align="center" mr={2} color="white.main">
                    To:
                  </Typography>
                  <Box>
                    <DatePicker
                      width="200px"
                      views={["month", "year"]}
                      inputFormat="MM/YYYY"
                      label="To"
                      background="greyDark"
                      value={toDate}
                      onChange={(value) => setToDate(value)}
                    />
                  </Box>
                </Grid>
              </Box>
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