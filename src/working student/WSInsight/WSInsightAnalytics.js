import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, Bar } from 'react-chartjs-2';
import axios from "../../services/axiosInstance";
import { format } from 'date-fns';

import { Chart, ArcElement, BarElement, Tooltip, CategoryScale, LinearScale } from 'chart.js';
import './WSInsightAnalytics.css';

Chart.register(ArcElement, Tooltip, BarElement, CategoryScale, LinearScale);

const WSInsightAnalytics = () => {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(2024);
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [fetchedTotalReports, setFetchedTotalReports] = useState(0);
  const [feedbackList, setFeedbackList] = useState([]);
  const [reportStatusCounts, setReportStatusCounts] = useState({
    pending: 0,
    approved: 0,
    denied: 0, // Default values to avoid ReferenceError
  });

  const onHomeTextClick = useCallback(() => {
    navigate("/wshomepage");
  }, [navigate]);

  const onREPORTSClick = useCallback(() => {
    navigate("/wsreport");
  }, [navigate]);

  const onLEADERBOARDClick = useCallback(() => {
    navigate("/wsleaderboards");
  }, [navigate]);

  const onPROFILEClick = useCallback(() => {
    navigate("/wsprofile");
  }, [navigate]);

  const decrementYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const incrementYear = () => {
    setCurrentYear(prev => prev + 1);
  };

  const toggleFeedback = () => {
    setFeedbackVisible(prev => !prev);
  };


  const data = {
    labels: ['Pending', 'Acknowledged', 'On-going', 'Resolved'],
    datasets: [
      {
        data: [
          reportStatusCounts.pending,
          reportStatusCounts.acknowledged,
          reportStatusCounts.ongoing,
          reportStatusCounts.resolved,
        ],
        backgroundColor: ['#F6C301', '#F97304', '#FF4B5C', '#FF69B4'], // Add colors for each section
        hoverBackgroundColor: ['#F6C301', '#F97304', '#FF4B5C', '#FF69B4'],
      },
    ],
  };
  

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right', // Position legend to the right
      },
      tooltip: {
        enabled: true, // Enable tooltips on hover
      },
      datalabels: {
        // Plugin for displaying percentages
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: '#000', // Percentage color
        font: {
          size: 14,
          weight: 'bold',
        },
        align: 'center', // Align the percentage inside the slice
      },
    },
  };


 
  // Bar chart data with values within 100 and some months missing data
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Physical Accidents',
        data: [20, 30], // Some months have no data (null)
        backgroundColor: 'rgba(249,65,68,1.00)',
      },
      {
        label: 'Laboratory Accident',
        data: [null, 25, null, null, null, 10], // Some months have no data (null)
        backgroundColor: 'rgba(243,114,44,1.00)',
      },
      {
        label: 'Facility-Related Accident',
        data: [10, null, 60], // Some months have no data (null)
        backgroundColor: 'rgba(248,150,30,1.00)',
      },
      {
        label: 'Environmental Accident',
        data: [null, null, null, 70], // Some months have no data (null)
        backgroundColor: 'rgba(249,132,74,0.78)',
      },
      {
        label: 'Health-Related Accident',
        data: [null, null, null, null, 40], // Some months have no data (null)
        backgroundColor: 'rgba(144,190,109,1.00)',
      },
      {
        label: 'Vehicle Accident',
        data: [null, null, null, null, null, 5], // Some months have no data (null)
        backgroundColor: 'rgba(67,170,139,1.00)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        max: 100, // Reduced the max value to align the bar heights properly
        ticks: {
          beginAtZero: true,
          stepSize: 20, // Keep a small step size to better align with the gray line
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
  };

  const [isOpen, setIsOpen] = useState(false);
 
  useEffect(() => {
    const fetchReportStatusCounts = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser"))?.userId;
        if (!userId) return;
  
        // API call to get the counts of pending, approved, and denied reports
        const response = await axios.get(`/api/user/reports/reportStatusCounts/${userId}`);
        console.log("Report Status Counts Response:", response.data); // Debugging log
        setReportStatusCounts(response.data);
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
  
        // Fetch total reports
        const totalResponse = await axios.get(`/api/feedback/totalReports/${userId}`);
        console.log("Total Reports Response:", totalResponse.data); // Debugging log
        setFetchedTotalReports(totalResponse.data.totalReports);
  
        // Fetch feedback list
        const feedbackResponse = await axios.get(`/api/feedback/latest/${userId}`);
        console.log("Feedback List Response:", feedbackResponse.data); // Debugging log
        setFeedbackList(feedbackResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <div className={`WSInsightAnalytics_WSInsightAnalytics ${isFeedbackVisible ? 'expanded' : 'minimized'}`}>
      <div className="WSNavbar">
        <img className="WSTitle" alt="" src="/TITLE.png" />
        <div className="nav-links">
          <div className="NHome" onClick={onHomeTextClick}>Home</div>
          <div className="NReports" onClick={onREPORTSClick}>Report</div>
          <div className="NLeaderboards" onClick={onLEADERBOARDClick}>Leaderboard</div>
          <b className="NInsight">Insight</b>
          <div className="NProfile" onClick={onPROFILEClick}>Profile</div>
        </div>
        {/* Toggle Navigation Button for mobile */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-toggle-icon">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <div className="NHome-mobile" onClick={onHomeTextClick}>Home</div>
              <div className="NReports-mobile" onClick={onREPORTSClick}>Report</div>
              <div className="NLeaderboards-mobile" onClick={onLEADERBOARDClick}>Leaderboard</div>
              <b className="NInsight-mobile">Insight</b>
              <div className="NProfile-mobile" onClick={onPROFILEClick}>Profile</div>
            </div>
          </div>
        )}
      </div>

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
        <span className='MonthlyAccidentEventStats'>Accident and Event Statistics by Month<br /> </span>
        <div className="BarGraph" style={{ height: '280px', width: '83%' }}>
          <Bar
            data={barData}
            options={{
              ...barOptions,
              maintainAspectRatio: false, // Make the graph responsive
              responsive: true,
            }}
          />

          <div className='grayline' />

          <div className='PAContainer'>
            <span className='PhysicalAccident'>Physical Accident</span>
            <div className='PABox' />
          </div>

          <div className='EAContainer'>
            <span className='EnvironmentalAccident'>Environmental Accident</span>
            <div className='EABox' />
          </div>

          <div className='VAContainer'>
            <span className='VehicleAccident'>Vehicle Accident</span>
            <div className='VABox' />
          </div>

          <div className='LAContainer'>
            <span className='LaboratoryAccident'>Laboratory Accident</span>
            <div className='LABox' />
          </div>

          <div className='FireRelatedContainer'>
            <span className='FireRelatedAccident'>Fire-Related Accident</span>
            <div className='FireRelatedBox' />
          </div>

          <div className='EquipmentRelatedContainer'>
            <span className='EquipmentRelatedAccident'>Equipment-Related Accident</span>
            <div className='EquipmentRelatedBox' />
          </div>

          <div className='FacilityRelatedContainer'>
            <span className='FacilityRelatedAccident'>Facility-Related Accident</span>
            <div className='FacilityRelatedBox' />
          </div>

          <div className='HRContainer'>
            <span className='HealthRelatedAccident'>Health-Related Accident</span>
            <div className='HRBox' />
          </div>

          <div className='EventContainer'>
            <span className='Event'>Event</span>
            <div className='EventBox' />
          </div>
        </div>
      </div>

      <div className="PieChartContainer">
    <h3>Report Distribution by Status</h3>
    <Pie data={data} options={options} />
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
          {feedbackList.map((feedback, index) => (
            <tr key={index}>
              <td>{format(new Date(feedback.submissionDate), 'yyyy-MM-dd')}</td>
              <td>{feedback.location}</td>
              <td>{feedback.reportCategory}</td>
              <td
                style={{
                  color:
                    feedback.status === 'PENDING'
                      ? '#F6C301'
                      : feedback.status === 'APPROVED'
                      ? '#4CAF50'
                      : feedback.status === 'DENIED'
                      ? '#F44336'
                      : '#000',
                }}
              >
                {feedback.status}
              </td>
              <td>
                {feedback.dateResolved
                  ? format(new Date(feedback.dateResolved), 'yyyy-MM-dd')
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
