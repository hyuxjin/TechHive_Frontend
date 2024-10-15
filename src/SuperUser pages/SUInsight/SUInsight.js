import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import * as XLSX from 'xlsx'; // Import XLSX for Excel generation
import SUNavBar from "../../components/SUNavBar";
import './SUInsight.css';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SUInsight = () => {
  const [year, setYear] = useState(2024);
  const [office, setOffice] = useState('Clinic Office');
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState('');

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleOfficeChange = (event) => {
    setOffice(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleToggle = () => {
    setShowReportDetails(!showReportDetails);
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData); // Convert data to worksheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports'); // Append worksheet to the workbook
    XLSX.writeFile(workbook, 'report_data.xlsx'); // Trigger file download
  };

  // Bar chart data for reports received
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Reports received',
        data: [40, 90, 60, 50, 60, 70, 80, 85, 80, 90, 95, 85],
        backgroundColor: [
          'red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'violet', 'rose', 'pink',
        ],
      },
    ],
  };

  // Options for the bar chart
  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Pie chart data for approved and denied reports (Donut chart)
  const pieData = {
    labels: ['Approved', 'Denied'],
    datasets: [
      {
        label: 'Reports Approval',
        data: [80, 20],
        backgroundColor: ['green', 'red'],
        hoverOffset: 4,
      },
    ],
  };

  // Options for the donut chart
  const pieOptions = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '70%', // Converts pie chart to donut chart with a 70% cutout
  };

  // Sample data for the table
  const tableData = [
    { name: 'Richard Molina', submissionDate: '2024-01-16', status: 'Approved', dateVerified: '2024-01-16 | 1 AM', category: 'Critical Report' },
    // Add more sample data as needed
  ];

  return (
    <div className="ad-insight-container">
      <SUNavBar />
      
      <img src={`${process.env.PUBLIC_URL}/insighthead.png`} alt="Insight Header" className="insight-header-image" />

      <div className="dropdown-container">
        <FormControl variant="outlined" className="dropdown">
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            id="year-select"
            value={year}
            onChange={handleYearChange}
            label="Year"
          >
            <MenuItem value={2023}>2023</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
            <MenuItem value={2025}>2025</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" className="dropdown">
          <InputLabel id="office-label">Office</InputLabel>
          <Select
            labelId="office-label"
            id="office-select"
            value={office}
            onChange={handleOfficeChange}
            label="Office"
          >
            <MenuItem value="Clinic Office">Clinic Office</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="chart-container">
        <h2>Reports Received</h2>
        <div style={{ width: '600px', height: '300px' }}> {/* Increased width for the bar chart */}
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h2>Approved and Denied Reports</h2>
        <div style={{ width: '300px', height: '300px' }}> {/* Set the size for the donut chart */}
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      <Button variant="contained" color="primary" onClick={handleToggle}>
        {showReportDetails ? 'Hide Full List of Reports' : 'See Full List of Reports'}
      </Button>

      {showReportDetails && (
        <div className="report-details-container">
          <div className="dropdown-container">
            <FormControl variant="outlined" className="dropdown">
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                id="month-select"
                value={month}
                onChange={handleMonthChange}
                label="Month"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="January">January</MenuItem>
                <MenuItem value="February">February</MenuItem>
                <MenuItem value="March">March</MenuItem>
                <MenuItem value="April">April</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" className="dropdown">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status-select"
                value={status}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Denied">Denied</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" color="secondary" onClick={exportToExcel}>
              Download Excel
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date Verified</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.submissionDate}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.dateVerified}</TableCell>
                    <TableCell>{row.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default SUInsight;
