import React, { useState, useEffect } from 'react';
import AdNavBar from '../../components/AdNavBar';
import './AdEntry.css';

const BASE_URL = 'http://localhost:8080';

const AdEntry = () => {
  const [reports, setReports] = useState([]);
  const [flaggedReports, setFlaggedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const getFilteredReports = () => {
      const filtered = {
        flagged: reports.filter(report => report.isFlagged)
      };
      console.log('Filtered flagged reports:', filtered.flagged);
      setFlaggedReports(filtered.flagged);
    };
    getFilteredReports();
  }, [reports]);

  const getStatusFromBackend = (status) => {
    console.log('Converting backend status:', status);
    const statusMap = {
      'PENDING': 'pending',
      'ACKNOWLEDGED': 'acknowledged',
      'IN_PROGRESS': 'in-progress',
      'RESOLVED': 'resolved'
    };
    const mappedStatus = statusMap[status] || 'pending';
    console.log('Mapped to frontend status:', mappedStatus);
    return mappedStatus;
  };

  const getBackendStatus = (frontendStatus) => {
    const statusMap = {
      'pending': 'PENDING',
      'acknowledged': 'ACKNOWLEDGED',
      'in-progress': 'IN_PROGRESS',
      'resolved': 'RESOLVED'
    };
    return statusMap[frontendStatus] || 'PENDING';
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/user/reports`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
  
      // Map reports and include isFlagged field
      const transformedReports = data.map(report => {
        const date = new Date(report.submittedAt); // Get the date from the backend response
        const validDate = !isNaN(date) ? date.toLocaleDateString() : 'Invalid Date';
        return {
          id: report.reportId,
          name: report.userFullName || 'Anonymous',
          category: report.reportType || 'General Report',
          location: report.location || 'Unknown Location',
          description: report.description || '',
          images: [report.image1Path, report.image2Path, report.image3Path].filter(Boolean),
          date: validDate,
          status: getStatusFromBackend(report.status),
          isFlagged: report.isFlagged || false,  
          concernedOffice: report.concernedOffice || 'General Office'
        };
      });
  
      setReports(transformedReports);
    } catch (err) {
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  

  const toggleFlag = async (reportId) => {
    try {
      // Get the report you want to toggle
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return { ...report, isFlagged: !report.isFlagged };
        }
        return report;
      });
      setReports(updatedReports); // Update local state to reflect the flag change
  
      // Update the backend with the new flag status
      const reportToUpdate = updatedReports.find(report => report.id === reportId);
      const updatedFlagStatus = reportToUpdate.isFlagged ? 1 : 0;
  
      // Send the PUT request to update the isFlagged field in the database
      const response = await fetch(`${BASE_URL}/api/user/reports/${reportId}/flag`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFlagged: updatedFlagStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update flag status');
      }
  
      // Optionally, re-fetch the reports or confirm the update
      await fetchReports();
    } catch (err) {
      console.error('Error toggling flag:', err);
      setError('Failed to update flag status. Please try again.');
    }
  };
  
  
  const handleReportClick = async (report) => {
    try {
      console.log('Report clicked:', report);
      if (report.status === 'pending') {
        await updateTrafficLight(report.id, 'acknowledged');
        setSelectedReport({ ...report, status: 'acknowledged' });
      } else {
        setSelectedReport(report);
      }
    } catch (err) {
      console.error('Error handling report click:', err);
      setError('Failed to update report status.');
    }
  };

  const closeReportModal = () => setSelectedReport(null);

  const updateTrafficLight = async (reportId, newStatus) => {
    try {
      console.log('Updating status:', reportId, newStatus);
      const backendStatus = getBackendStatus(newStatus);
      
      const response = await fetch(`${BASE_URL}/api/user/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: backendStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update status:', response.status, errorText);
        throw new Error('Failed to update status');
      }

      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        )
      );

      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }

      await fetchReports();
    } catch (err) {
      setError('Failed to update report status. Please try again.');
      console.error('Error updating status:', err);
    }
  };

  const TrafficLights = ({ report, isClickable }) => (
    <div className="traffic-lights">
      <div 
        className={`traffic-circle red ${report.status === 'pending' ? 'active' : ''}`}
      />
      <div 
        className={`traffic-circle gray ${report.status === 'acknowledged' ? 'active' : ''}`}
        onClick={isClickable && report.status !== 'acknowledged' ? 
          () => updateTrafficLight(report.id, 'acknowledged') : undefined}
        style={isClickable && report.status !== 'acknowledged' ? { cursor: 'pointer' } : {}}
      />
      <div 
        className={`traffic-circle yellow ${report.status === 'in-progress' ? 'active' : ''}`}
        onClick={isClickable && report.status !== 'in-progress' ? 
          () => updateTrafficLight(report.id, 'in-progress') : undefined}
        style={isClickable && report.status !== 'in-progress' ? { cursor: 'pointer' } : {}}
      />
      <div 
        className={`traffic-circle green ${report.status === 'resolved' ? 'active' : ''}`}
        onClick={isClickable && report.status !== 'resolved' ? 
          () => updateTrafficLight(report.id, 'resolved') : undefined}
        style={isClickable && report.status !== 'resolved' ? { cursor: 'pointer' } : {}}
      />
    </div>
  );

  const ReportCard = ({ report }) => (
    <div className="entrypost-card" onClick={() => handleReportClick(report)}>
      <div className="card-header">
        <TrafficLights report={report} isClickable={false} />
        <button
  onClick={(e) => {
    e.stopPropagation();  // Prevents the event from propagating to parent elements
    toggleFlag(report.id); // Call the function to toggle the flag
  }}
  className="flag-icon"
>
  🚩
</button>

      </div>

      <div className="entry-profile-container">
        <h5 className="profile-name">{report.name}</h5>
      </div>

      <div className="entry-details">
        <h5>Date: <span>{report.date}</span></h5>
        <h5>Location: <span>{report.location}</span></h5>
        {report.concernedOffice && (
          <h5>Office: <span>{report.concernedOffice}</span></h5>
        )}
        <p className="description">{report.description}</p>
      </div>
    </div>
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const path = imagePath.startsWith('/uploads/') ? imagePath : `/uploads/${imagePath}`;
    return `${BASE_URL}${path}`;
  };

  if (loading) return (
    <div className="entrymain-container">
      <header>
        <AdNavBar />
      </header>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="entrymain-container">
      <header>
        <AdNavBar />
      </header>
      <div className="error-message">
        ⚠️ {error}
      </div>
    </div>
  );

  const getPendingReports = () => {
    const pending = reports.filter(report => 
      report.status === 'pending' || report.status === 'acknowledged'
    );
    console.log('Filtered pending reports:', pending);
    return pending;
  };

  const getInProgressReports = () => {
    const inProgress = reports.filter(report => report.status === 'in-progress');
    console.log('Filtered in-progress reports:', inProgress);
    return inProgress;
  };

  const getResolvedReports = () => {
    const resolved = reports.filter(report => report.status === 'resolved');
    console.log('Filtered resolved reports:', resolved);
    return resolved;
  };

  return (
    <div className="entrymain-container">
      <header>
        <AdNavBar />
      </header>
      <div className="entrysub-container">
        <h1 className="dashboard-title">Reports Dashboard</h1>
        
        <section className="reports-section">
          <h2 className="section-title">Flagged Reports ({flaggedReports.length})</h2>
          <div className="reports-container">
            {flaggedReports.length > 0 ? (
              flaggedReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <p className="no-reports">No flagged reports</p>
            )}
          </div>
        </section>

        <section className="reports-section">
          <h2 className="section-title">Pending Reports ({getPendingReports().length})</h2>
          <div className="reports-container">
            {getPendingReports().length > 0 ? (
              getPendingReports().map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <p className="no-reports">No pending reports</p>
            )}
          </div>
        </section>

        <section className="reports-section">
          <h2 className="section-title">In-Progress Reports ({getInProgressReports().length})</h2>
          <div className="reports-container">
            {getInProgressReports().length > 0 ? (
              getInProgressReports().map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <p className="no-reports">No in-progress reports</p>
            )}
          </div>
        </section>

        <section className="reports-section">
          <h2 className="section-title">Resolved Reports ({getResolvedReports().length})</h2>
          <div className="reports-container">
            {getResolvedReports().length > 0 ? (
              getResolvedReports().map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <p className="no-reports">No resolved reports</p>
            )}
          </div>
        </section>

        {selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  onClick={closeReportModal}
                  className="back-button"
                >
                  ←
                </button>
                <div className="traffic-lights-and-flag">
                  <TrafficLights report={selectedReport} isClickable={true} />
                  <button
                    onClick={() => toggleFlag(selectedReport.id)}
                    className="flag-icon"
                  >
                    🚩
                  </button>
                </div>
              </div>

              <div className="modal-body">
                <h2>{selectedReport.name}</h2>
                <div className="report-details">
                  <p><strong>Date:</strong> {selectedReport.date}</p>
                  <p><strong>Location:</strong> {selectedReport.location}</p>
                  <p><strong>Category:</strong> {selectedReport.category}</p>
                  {selectedReport.concernedOffice && (
                    <p><strong>Concerned Office:</strong> {selectedReport.concernedOffice}</p>
                  )}
                  <p className="description">{selectedReport.description}</p>
                </div>

                {selectedReport.images?.length > 0 && (
                  <div className="modal-image-container">
                    {selectedReport.images.filter(Boolean).map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`Report ${idx + 1}`}
                        className="modal-image-small"
                        onError={(e) => {
                          console.error('Failed to load image:', img);
                          e.target.src = "/api/placeholder/200/200";
                          e.target.onerror = null;
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdEntry;