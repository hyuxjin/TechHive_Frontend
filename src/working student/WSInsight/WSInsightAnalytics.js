import React, { useState, useEffect } from "react";
import { Pie, Bar } from 'react-chartjs-2';
import axios from "../../services/axiosInstance";
import { format } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import WSNavBar from '../WSHomepage/WSNavBar';

import { Chart, ArcElement, BarElement, Tooltip, CategoryScale, LinearScale, Legend } from 'chart.js';
import './WSInsightAnalytics.css';

Chart.register(ArcElement, Tooltip, BarElement, CategoryScale, LinearScale, ChartDataLabels, Legend);

const WSInsightAnalytics = () => {
  const [currentYear, setCurrentYear] = useState(2024);
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [fetchedTotalReports, setFetchedTotalReports] = useState(0);
  const [feedbackList, setFeedbackList] = useState([]);
  const [reportStatusCounts, setReportStatusCounts] = useState({
    pending: 0,
    acknowledged: 0,
    ongoing: 0,
    resolved: 0,
  });
  const [pendingReportsByMonth, setPendingReportsByMonth] = useState([]);

  const decrementYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const incrementYear = () => {
    setCurrentYear(prev => prev + 1);
  };

  const toggleFeedback = () => {
    setFeedbackVisible(prev => !prev);
  };

  const totalReports = 
    (reportStatusCounts.pending || 0) + 
    (reportStatusCounts.acknowledged || 0) + 
    (reportStatusCounts.ongoing || 0) + 
    (reportStatusCounts.resolved || 0);

  const percentages = {
    pending: totalReports > 0 ? ((reportStatusCounts.pending || 0) / totalReports * 100).toFixed(1) : 0,
    acknowledged: totalReports > 0 ? ((reportStatusCounts.acknowledged || 0) / totalReports * 100).toFixed(1) : 0,
    ongoing: totalReports > 0 ? ((reportStatusCounts.ongoing || 0) / totalReports * 100).toFixed(1) : 0,
    resolved: totalReports > 0 ? ((reportStatusCounts.resolved || 0) / totalReports * 100).toFixed(1) : 0,
  };

  const data = {
    labels: ['Pending', 'Acknowledged', 'On-going', 'Resolved'],
    datasets: [
      {
        data: [
          reportStatusCounts.pending || 0,
          reportStatusCounts.acknowledged || 0,
          reportStatusCounts.ongoing || 0,
          reportStatusCounts.resolved || 0,
        ],
        backgroundColor: ['#F6C301', '#F97304', '#FF4B5C', '#FF69B4'],
        hoverBackgroundColor: ['#F6C301', '#F97304', '#FF4B5C', '#FF69B4'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'center',
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        formatter: (value, ctx) => {
          const percentage = totalReports > 0 ? (value / totalReports) * 100 : 0;
          if (ctx.dataIndex === 0 && value > 0) {
            return `${percentage.toFixed(1)}%`;
          }
          return '';
        },
        color: '#000',
        font: {
          size: 14,
          weight: 'bold',
        },
        align: 'center',
      },
    },
  };

  const barData = {
    labels: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    datasets: [
      {
        label: "Pending Reports",
        data: pendingReportsByMonth,
        backgroundColor: "#F6C301",
        borderColor: "#F6C301",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Pending Reports",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  useEffect(() => {
    const fetchReportStatusCounts = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser"))?.userId;
        if (!userId) return;

        const response = await axios.get(`/api/user/reports/reportStatusCounts/${userId}`);
        console.log("Report Status Counts Response:", response.data);
        setReportStatusCounts({
          pending: response.data.pending || 0,
          acknowledged: response.data.acknowledged || 0,
          ongoing: response.data.in_progress || 0,
          resolved: response.data.resolved || 0
        });
      } catch (error) {
        console.error("Failed to fetch report status counts:", error);
      }
    };

    fetchReportStatusCounts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser"))?.userId;
        if (!userId) return;

        // Fetch user's reports
        const reportsResponse = await axios.get(`/api/user/reports/user/${userId}`);
        console.log("User Reports Response:", reportsResponse.data);
        setFeedbackList(reportsResponse.data);
        setFetchedTotalReports(reportsResponse.data.length);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const response = await axios.get("/api/user/reports/pending/monthly");
        console.log("Pending Reports by Month:", response.data);

        // Map the response data to an array of counts
        const monthlyData = Array(12).fill(0);
        response.data.forEach(item => {
          monthlyData[item.month - 1] = item.count;
        });

        setPendingReportsByMonth(monthlyData);
      } catch (error) {
        console.error("Error fetching pending reports by month:", error);
      }
    };

    fetchPendingReports();
  }, []);

  return (
    <div className={`WSInsightAnalytics_WSInsightAnalytics ${isFeedbackVisible ? 'expanded' : 'minimized'}`}>
      <WSNavBar />

      <img className="InsightTitle" alt="" src="/WSInsightAnalytics_insight.png" />
      <b className="AnalyticsTitle">Analytics</b>

      <div className="WSInsightBox" />

      <div className="YearContainer">
        <div className="YearBox" />
        <span className='Year'>Year</span>
        <img className="Calendar" alt="" src="/WSInsight_Calendar.png" />
        <img className="arrow_left" alt="" src="/WsInsight_Leftbtn.png" onClick={decrementYear} />
        <span className='_2024'>{currentYear}</span>
        <img className="arrow_right" alt="" src="/WsInsight_Rightbtn.png" onClick={incrementYear} />
      </div>

      <div className="BarGraphContainer">
        <div className="BarBox" />
        <span className='MonthlyAccidentEventStats'>Reports Resolved vs. Unresolved by Month<br /> </span>
        <div className="BarGraph" style={{ height: '340px', width: '90%' }}>
          <Bar data={barData} options={{
            ...barOptions,
            maintainAspectRatio: false,
            responsive: true,
          }} />
        </div>
      </div>

      <div className="PieBackground"></div>
      <div className="PieChartContainer">
        <h3>Report Distribution by Status</h3>
        <Pie data={data} options={options} />
        <div className="custom-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#F6C301' }}></span>
            <span>Pending: {reportStatusCounts.pending || 0} ({percentages.pending}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#F97304' }}></span>
            <span>Acknowledged: {reportStatusCounts.acknowledged || 0} ({percentages.acknowledged}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF4B5C' }}></span>
            <span>On-going: {reportStatusCounts.ongoing || 0} ({percentages.ongoing}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF69B4' }}></span>
            <span>Resolved: {reportStatusCounts.resolved || 0} ({percentages.resolved}%)</span>
          </div>
        </div>
      </div>

      {isFeedbackVisible && (
        <>
          <div className={`FeedbackSection ${isFeedbackVisible ? 'visible' : 'hidden'}`}></div>
          <div className="WSInsightBox2">
            <div className="TableContainer">
              <span className="TOTALREPORTSSUBMITTED">TOTAL REPORTS SUBMITTED</span>
              <div className="TotalWrapper">
                <div className="Total1" />
                <span className="TotalNumber1">{fetchedTotalReports}</span>
              </div>
              <div className="TableWrapper">
                <table className="FeedbackTable">
                  <thead>
                    <tr>
                      <th>Submission Date</th>
                      <th>Location</th>
                      <th>Report Category</th>
                      <th>Status</th>
                      <th>Date Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackList.map((report, index) => (
                      <tr key={index}>
                        <td>{format(new Date(report.submittedAt), 'yyyy-MM-dd')}</td>
                        <td>{report.location}</td>
                        <td>{report.reportCategory}</td>
                        <td style={{
                          color: report.status === 'PENDING' ? '#F6C301'
                            : report.status === 'ACKNOWLEDGED' ? '#F97304'
                            : report.status === 'IN_PROGRESS' ? '#FF4B5C'
                            : report.status === 'RESOLVED' ? '#FF69B4'
                            : '#000'
                        }}>
                          {report.status}
                        </td>
                        <td>
                          {report.resolvedAt
                            ? format(new Date(report.resolvedAt), 'yyyy-MM-dd')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <div className='ReportFeedbackContainer'>
        <span className='ReportFeedback'>Report Feedback</span>
        <img
          className="Toggle"
          alt=""
          src={isFeedbackVisible ? "/Toggledown.png" : "/Toggleright.png"}
          onClick={toggleFeedback}
        />
      </div>
    </div>
  );
};

export default WSInsightAnalytics;