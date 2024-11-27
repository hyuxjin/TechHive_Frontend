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

  const getStatusFromBackend = (status) => {
    const statusMap = {
      'PENDING': 'pending',
      'IN_PROGRESS': 'ongoing',
      'APPROVED': 'resolved',
      'DENIED': 'acknowledged'
    };
    return statusMap[status] || 'pending';
  };

  const getBackendStatus = (frontendStatus) => {
    const statusMap = {
      'pending': 'PENDING',
      'ongoing': 'IN_PROGRESS',
      'resolved': 'APPROVED',
      'acknowledged': 'DENIED'
    };
    return statusMap[frontendStatus] || 'PENDING';
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports from:', `${BASE_URL}/api/user/reports`);
      const response = await fetch(`${BASE_URL}/api/user/reports`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', response.status, errorText);
        throw new Error(`Failed to fetch reports: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Raw data from backend:', data);
      
      if (!Array.isArray(data)) {
        console.error('Received data is not an array:', data);
        throw new Error('Invalid data format received');
      }

      const transformedReports = data.map(report => {
        const images = [
          report.image1Path,
          report.image2Path,
          report.image3Path
        ].filter(Boolean);

        return {
          id: report.reportId,
          name: report.userFullName || 'Anonymous',
          category: report.reportType || 'General Report',
          location: report.location || 'Unknown Location',
          description: report.description || '',
          images: images,
          date: report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'Invalid Date',
          status: getStatusFromBackend(report.status),
          isFlagged: false,
          concernedOffice: report.concernedOffice || 'General Office'
        };
      });

      transformedReports.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('Transformed reports:', transformedReports);
      setReports(transformedReports);
      setFlaggedReports(transformedReports.filter(report => report.isFlagged));
      
    } catch (err) {
      setError('Failed to load reports. Please try again later.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (reportId) => {
    setReports(prevReports => {
      const updatedReports = prevReports.map(report => {
        if (report.id === reportId) {
          const updatedReport = { ...report, isFlagged: !report.isFlagged };
          if (updatedReport.isFlagged) {
            setFlaggedReports(prev => [...prev, updatedReport]);
          } else {
            setFlaggedReports(prev => prev.filter(r => r.id !== reportId));
          }
          return updatedReport;
        }
        return report;
      });
      return updatedReports;
    });
  };

  const handleReportClick = (report) => {
    console.log('Report clicked:', report);
    if (report.status === 'pending') {
      const updatedReport = { ...report, status: 'acknowledged' };
      updateTrafficLight(report.id, 'acknowledged');
      setSelectedReport(updatedReport);
    } else {
      setSelectedReport(report);
    }
  };

  const closeReportModal = () => setSelectedReport(null);

  const updateTrafficLight = async (reportId, newStatus) => {
    try {
      console.log('Updating status:', reportId, newStatus);
      const response = await fetch(`${BASE_URL}/api/user/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: getBackendStatus(newStatus) })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update status:', response.status, errorText);
        throw new Error('Failed to update status');
      }

      await fetchReports(); // Refresh all reports after update
    } catch (err) {
      setError('Failed to update report status. Please try again.');
      console.error('Error updating status:', err);
    }
  };

  const TrafficLights = ({ report, isClickable }) => (
    <div className="traffic-lights">
      <div 
        className={`traffic-circle maroon ${report.status === 'pending' ? 'active' : ''}`}
      />
      <div 
        className={`traffic-circle gray ${report.status === 'acknowledged' ? 'active' : ''}`}
        onClick={isClickable ? () => updateTrafficLight(report.id, 'acknowledged') : undefined}
        style={isClickable ? { cursor: 'pointer' } : {}}
      />
      <div 
        className={`traffic-circle yellow ${report.status === 'ongoing' ? 'active' : ''}`}
        onClick={isClickable ? () => updateTrafficLight(report.id, 'ongoing') : undefined}
        style={isClickable ? { cursor: 'pointer' } : {}}
      />
      <div 
        className={`traffic-circle green ${report.status === 'resolved' ? 'active' : ''}`}
        onClick={isClickable ? () => updateTrafficLight(report.id, 'resolved') : undefined}
        style={isClickable ? { cursor: 'pointer' } : {}}
      />
    </div>
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    console.log('Original image path:', imagePath);
    
    if (imagePath.startsWith('http')) {
      console.log('Using direct URL:', imagePath);
      return imagePath;
    }
    
    const path = imagePath.startsWith('/uploads/') 
      ? imagePath 
      : `/uploads/${imagePath}`;
    
    const fullUrl = `${BASE_URL}${path}`;
    console.log('Constructed URL:', fullUrl);
    return fullUrl;
  };

  const ReportCard = ({ report }) => {
    console.log('Rendering report card:', report);
    return (
      <div className="entrypost-card" onClick={() => handleReportClick(report)}>
        <div className="card-header">
          <TrafficLights report={report} isClickable={false} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFlag(report.id);
            }}
            className="flag-icon"
          >
            🚩
          </button>
        </div>

        <div className="entry-profile-container">
          <img
            src="/api/placeholder/40/40"
            alt="Profile"
            className="profile-picture"
          />
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

        {report.images?.length > 0 && (
          <div className="entry-images">
            {report.images.filter(Boolean).map((img, idx) => {
              const imageUrl = getImageUrl(img);
              console.log(`Image ${idx + 1} URL:`, imageUrl);
              
              return (
                <img
                  key={idx}
                  src={imageUrl}
                  alt={`Report ${idx + 1}`}
                  className="report-image"
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl);
                    e.target.src = "/api/placeholder/80/80";
                    e.target.onerror = null;
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="entrymain-container">
        <header>
          <AdNavBar />
        </header>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="entrymain-container">
        <header>
          <AdNavBar />
        </header>
        <div className="error-message">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter(report => report.status === 'pending');
  const otherReports = reports.filter(report => !report.isFlagged && report.status !== 'pending');

  return (
    <div className="entrymain-container">
      <header>
        <AdNavBar />
      </header>
      <div className="entrysub-container">
        <h1 className="dashboard-title">Reports Dashboard</h1>
        
        <section className="reports-section">
          <h2 className="section-title">Pending Reports ({pendingReports.length})</h2>
          <div className="reports-container">
            {pendingReports.length > 0 ? (
              pendingReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <p className="no-reports">No pending reports</p>
            )}
          </div>
        </section>

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
          <h2 className="section-title">Other Reports ({otherReports.length})</h2>
          <div className="reports-container">
            {otherReports.length > 0 ? (
              otherReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <p className="no-reports">No other reports</p>
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