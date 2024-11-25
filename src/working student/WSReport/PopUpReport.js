import React, { useCallback, useState, useEffect, lazy, Suspense, useRef } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "./PopUpReport.css";
import axios from 'axios';

const PopUpConfirm = lazy(() => import('./PopUpConfirm'));

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const PopUpReport = () => {
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (storedUser && storedUser.username) {
        try {
          const response = await axios.get(`http://localhost:8080/user/getByUsername?username=${storedUser.username}`);
          setLoggedInUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setErrorMessage('Error fetching user data. Please try again.');
        }
      }
    };
    fetchLoggedInUser();
  }, []);

  const toggleConfirm = useCallback(() => {
    if (selectedLevel && selectedType && uploadedImage) {
      setConfirmVisible((prev) => !prev);
      setErrorMessage('');
    } else {
      setErrorMessage('Please fill out all fields and upload an image before submitting.');
    }
  }, [selectedLevel, selectedType, uploadedImage]);
  

  const handleSubmit = async () => {
    if (selectedLevel && selectedType && uploadedImage && loggedInUser) {
      setIsLoading(true);
      try {
        const imageResponse = await fetch(uploadedImage);
        const blob = await imageResponse.blob();
  
        const formData = new FormData();
        formData.append('user', loggedInUser.userId);
        formData.append('idNumber', loggedInUser.idNumber);
        formData.append('fullName', loggedInUser.fullName);
        formData.append('level', selectedLevel);
        formData.append('type', selectedType);
        formData.append('photo', blob, 'image.jpg');
  
        const submitResponse = await axios.post('http://localhost:8080/entries', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Entry created:', submitResponse.data);
        setSuccessMessage('Report submitted successfully!');
        toggleConfirm();
        // Reset form fields
        setSelectedLevel('');
        setSelectedType('');
        setUploadedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Notify of new report
        localStorage.setItem("newReport", "true");
      } catch (error) {
        console.error('Error creating entry:', error);
        setErrorMessage('Error submitting report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMessage('Please fill out all fields and ensure you are logged in before submitting.');
    }
  };
  
  const handleLevelChange = (event) => {
    setSelectedLevel(event.target.value);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.onerror = () => {
        setErrorMessage('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateInputs = () => {
    if (!selectedLevel) {
      setErrorMessage('Please select a level of incident.');
      return false;
    }
    if (!selectedType) {
      setErrorMessage('Please select an incident type.');
      return false;
    }
    if (!uploadedImage) {
      setErrorMessage('Please upload an image.');
      return false;
    }
    return true;
  };

  return (
    <div className="pop-up-report">
      <div className="PopUpReport-Box" />
      <div className="LevelIncident-Container">
        <div className="level-of-incident">Level of Incident</div>
        <div className="Incident-Input">
          <Select
            id="incident-level"
            name="incident-level"
            value={selectedLevel}
            onChange={handleLevelChange}
            displayEmpty
            className="SelectInput"
            style={{ width: "200px", color: "#8A252C" }}
          >
            <MenuItem value="" disabled>
              Choose here
            </MenuItem>
            <MenuItem value="Minor">Minor</MenuItem>
            <MenuItem value="Moderate">Moderate</MenuItem>
            <MenuItem value="Major">Major</MenuItem>
          </Select>
        </div>
      </div>
      <div className="IncidentType-Container">
        <div className="IncidentType-Name">Incident Type</div>
        <div className="Incident-Input">
          <Select
            id="incident-type"
            name="incident-type"
            value={selectedType}
            onChange={handleTypeChange}
            displayEmpty
            className="SelectInput"
            style={{ width: "200px", color: "#8A252C" }}
          >
            <MenuItem value="" disabled>
              Choose here
            </MenuItem>
            <MenuItem value="Natural Incident">Natural Incident</MenuItem>
            <MenuItem value="Health-Related Incidents">Health-Related Incidents</MenuItem>
            <MenuItem value="Environmental Incidents">Environmental Incidents</MenuItem>
          </Select>
        </div>
      </div>
      <div className="UploadPhoto-Container">
        <div className="Upload-Button">
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            id="file-input"
            name="file-input"
            ref={fileInputRef}
            onChange={handleImageUpload} 
          />
          <label htmlFor="file-input" className="upload-label">
            <img className="upload-icon" alt="Upload Icon" src="/upload-icon.png" />
          </label>
        </div>
        <div className="UP-Name1">Upload photo (For evidence, max 5MB)</div>
        {uploadedImage && <img className="uploaded-image" src={uploadedImage} alt="Uploaded" />}
      </div>
      <div className="ReportContainer">
        <Button
          className="ReportButton"
          variant="contained"
          sx={{
            borderRadius: "10px",
            width: 165,
            height: 40,
            backgroundColor: "#8A252C",
            "&:hover": { backgroundColor: "#A91D3A" }
          }}
          onClick={() => {
            if (validateInputs()) {
              toggleConfirm();
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? 'SUBMITTING...' : 'REPORT'}
        </Button>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
      {isConfirmVisible && (
        <div className="overlay" onClick={toggleConfirm}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<div>Loading...</div>}>
              <PopUpConfirm onClose={toggleConfirm} onSubmit={handleSubmit} />
            </Suspense>
          </div>
        </div>
      )}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PopUpReport;
