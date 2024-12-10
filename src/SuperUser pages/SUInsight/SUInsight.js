import React, { useState, useEffect } from "react";
import axios from "../../services/axiosInstance";
import { format } from 'date-fns';
import SUNavBar from "../../components/SUNavBar";
import { Chart, ArcElement, BarElement, Tooltip, CategoryScale, LinearScale, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './SUInsight.css';

Chart.register(ArcElement, Tooltip, BarElement, CategoryScale, LinearScale, ChartDataLabels, Legend);

const SUInsight = () => {
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
  const [pendingReportsByMonth, setPendingReportsByMonth] = useState(Array(12).fill(0));

  const decrementYear = () => setCurrentYear(prev => prev - 1);
  const incrementYear = () => setCurrentYear(prev => prev + 1);
  const toggleFeedback = () => setFeedbackVisible(prev => !prev);

  const totalReports = Object.values(reportStatusCounts).reduce((a, b) => a + b, 0);

  const percentages = Object.fromEntries(
    Object.entries(reportStatusCounts).map(([key, value]) => [
      key,
      totalReports > 0 ? ((value || 0) / totalReports * 100).toFixed(1) : 0
    ])
  );

  const pieChartData = {
    labels: ['Pending', 'Acknowledged', 'On-going', 'Resolved'],
    datasets: [{
      data: Object.values(reportStatusCounts),
      backgroundColor: ['#F6C301', '#F97304', '#FF4B5C', '#FF69B4'],
      hoverBackgroundColor: ['#F6C301', '#F97304', '#FF4B5C', '#FF69B4'],
    }],
  };

  const pieChartOptions = {
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
          return ctx.dataIndex === 0 && value > 0 ? `${percentage.toFixed(1)}%` : '';
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

  const barChartData = {
    labels: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    datasets: [{
      label: "Pending Reports",
      data: pendingReportsByMonth,
      backgroundColor: "#F6C301",
      borderColor: "#F6C301",
      borderWidth: 1,
    }],
  };

  const barChartOptions = {
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
    const fetchAllData = async () => {
      try {
        const [reportsResponse, monthlyResponse] = await Promise.all([
          axios.get('/api/user/reports'),
          axios.get("/api/user/reports/pending/monthly")
        ]);

        const allReports = reportsResponse.data;
        
        const counts = allReports.reduce((acc, report) => {
          const status = report.status.toLowerCase();
          const statusKey = status === 'in_progress' ? 'ongoing' : status;
          acc[statusKey] = (acc[statusKey] || 0) + 1;
          return acc;
        }, {
          pending: 0,
          acknowledged: 0,
          ongoing: 0,
          resolved: 0
        });

        setReportStatusCounts(counts);
        setFeedbackList(allReports);
        setFetchedTotalReports(allReports.length);

        const monthlyData = Array(12).fill(0);
        monthlyResponse.data.forEach(item => {
          monthlyData[item.month - 1] = item.count;
        });
        setPendingReportsByMonth(monthlyData);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className={`SUInsight_SUInsight ${isFeedbackVisible ? 'expanded' : 'minimized'}`}>
      <SUNavBar />

      <img className="SUInsightTitle" alt="" src="/WSInsightAnalytics_insight.png" />
      <b className="SUAnalyticsTitle">Analytics</b>

      <div className="SUInsightBox" />

      <div className="SUYearContainer">
        <div className="SUYearBox" />
        <span className="SUYear">Year</span>
        <img className="SUCalendar" alt="" src="/WSInsight_Calendar.png" />
        <img 
          className="SUarrow_left" 
          alt="" 
          src="/WsInsight_Leftbtn.png" 
          onClick={decrementYear} 
        />
        <span className="SU_2024">{currentYear}</span>
        <img 
          className="SUarrow_right" 
          alt="" 
          src="/WsInsight_Rightbtn.png" 
          onClick={incrementYear} 
        />
      </div>

      <div className="SUBarGraphContainer">
        <div className="SUBarBox" />
        <span className="SUMonthlyAccidentEventStats">
          Reports Resolved vs. Unresolved by Month
        </span>
        <div className="SUBarGraph" style={{ height: '340px', width: '90%' }}>
          <Bar 
            data={barChartData} 
            options={{
              ...barChartOptions,
              maintainAspectRatio: false,
              responsive: true,
            }} 
          />
        </div>
      </div>

      <div className="SUPieBackground" />
      <div className="SUPieChartContainer">
        <h3>Report Distribution by Status</h3>
        <Pie data={pieChartData} options={pieChartOptions} />
        <div className="SUcustom-legend">
          {[
            { key: 'pending', color: '#F6C301', label: 'Pending' },
            { key: 'acknowledged', color: '#F97304', label: 'Acknowledged' },
            { key: 'ongoing', color: '#FF4B5C', label: 'On-going' },
            { key: 'resolved', color: '#FF69B4', label: 'Resolved' }
          ].map(({ key, color, label }) => (
            <div key={key} className="SUlegend-item">
              <span 
                className="SUlegend-color" 
                style={{ backgroundColor: color }} 
              />
              <span>
                {label}: {reportStatusCounts[key] || 0} ({percentages[key]}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {isFeedbackVisible && (
        <>
          <div className="SUFeedbackSection" />
          <div className="SUInsightBox2">
            <div className="SUTableContainer">
              <span className="SUTOTALREPORTSSUBMITTED">
                TOTAL REPORTS SUBMITTED
              </span>
              <div className="SUTotalWrapper">
                <div className="SUTotal1" />
                <span className="SUTotalNumber1">{fetchedTotalReports}</span>
              </div>
              <div className="SUTableWrapper">
                <table className="SUFeedbackTable">
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
                        <td>{report.reportType}</td>
                        <td style={{
                          color: {
                            'PENDING': '#F6C301',
                            'ACKNOWLEDGED': '#F97304',
                            'IN_PROGRESS': '#FF4B5C',
                            'RESOLVED': '#FF69B4'
                          }[report.status] || '#000'
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

      <div className="SUReportFeedbackContainer">
        <span className="SUReportFeedback">All Reports</span>
        <img
          className="SUToggle"
          alt=""
          src={isFeedbackVisible ? "/Toggledown.png" : "/Toggleright.png"}
          onClick={toggleFeedback}
        />
      </div>
    </div>
  );
};

export default SUInsight;