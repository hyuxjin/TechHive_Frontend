import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Select, MenuItem, FormControl, IconButton } from "@mui/material";
import { Snackbar, Alert, Dialog, DialogContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./PopUpReportFinal.css";
import axios from "../../services/axiosInstance";
import PopUpConfirm from "./PopUpConfirm";

// Predefined list of buildings with their latitudes and longitudes for location detection and manual selection
const locations = [
  { name: "Cebu Institute of Technology - University" },
  { name: "CIT-University ST Building" },
  { name: "CIT-U Science and Technology Parking Lot" },
  { name: "CIT-U BDO ATM" },
  { name: "CIT-U Accounting Office" },
  { name: "College of Engineering and Architecture" },
  { name: "Gregorio L. Escario Building" },
  { name: "CIT-U Chapel" },
  { name: "CIT-U College of Engineering and Architecture (CEA) Office" },
  { name: "CENTRAL VISAYAS FOOD INNOVATION CENTER" },
  { name: "CIT-U Main Canteen" },
  { name: "PE Classroom" },
  { name: "Parking Lot" },
  { name: "CIT-U Basketball Court" },
  { name: "CIT-U Junior High School Building" },
  { name: "CIT-U Chemical Engineering Department" },
  { name: "CIT-U Mechanical Engineering Department" },
  { name: "CIT-U Mining Engineering Department" },
  { name: "CIT-U Civil Engineering Department" },
  { name: "CIT-U College Library" },
  { name: "CIT-U Main Building" },
  { name: "CIT-U Volleyball Court" },
  { name: "CIT-U Gymnasium" },
  { name: "Elementary Building" },
  { name: "CIT-U University Playground" },
  { name: "CIT-U High School Canteen" },
  { name: "CIT-U Mini Canteen" },
  { name: "CIT-U Science and Technology Building" },
  { name: "Espacio CIT-U" },
];

// Modal for the "Outside Campus" warning
const OutsideCampusWarningModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content outside-campus-warning">
      <h3>You are outside the campus area.</h3>
      <button onClick={onClose} className="ok-button">OK</button>
    </div>
  </div>
);

// Define ImageLimitWarningModal
const ImageLimitWarningModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content image-limit-warning">
      <h3>You may add only up to 3 images</h3>
      <button onClick={onClose} className="ok-button">OK</button>
    </div>
  </div>
);

// Define FileSizeWarningModal
const FileSizeWarningModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content file-size-warning">
      <h3>You may only upload images with a maximum size of 2 MB.</h3>
      <button onClick={onClose} className="ok-button">OK</button>
    </div>
  </div>
);

// Define BackendValidationWarningModal
const BackendValidationWarningModal = ({ message, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content backend-validation-warning">
      <h3>{message}</h3>
      <button onClick={onClose} className="ok-button">OK</button>
    </div>
  </div>
);

// Define CameraModal
const CameraModal = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Unable to access the camera. Please check your permissions.");
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.translate(canvasRef.current.width, 0);
      context.scale(-1, 1);

      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      context.setTransform(1, 0, 0, 1, 0, 0);

      const image = canvasRef.current.toDataURL("image/png");
      stopCamera();
      onCapture(image);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="camera-modal">
      <button onClick={handleClose} className="camera-close-button">X</button>
      <div className="camera-feed-container">
        {error ? <p className="error-message">{error}</p> : <video ref={videoRef} autoPlay playsInline />}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="camera-controls">
        <button onClick={handleCapture} className="camera-capture-button">
          <div className="camera-capture-circle">
            <img src="/cam2.png" alt="Capture" className="camera-capture-icon" />
          </div>
        </button>
      </div>
    </div>
  );
};

const PopUpReportFinal = ({ onBack, onClose, locationDenied = false, onLocationRetry }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: "",
    location: { address: "", latitude: null, longitude: null },
    images: [],
  });

  const [showPopUpConfirm, setShowPopUpConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showImageLimitWarning, setShowImageLimitWarning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFileSizeWarning, setShowFileSizeWarning] = useState(false);
  const [showOutsideCampusWarning, setShowOutsideCampusWarning] = useState(false);
  const [showBackendValidationWarning, setShowBackendValidationWarning] = useState(false);
  const [backendValidationMessage, setBackendValidationMessage] = useState("");

  // State for handling suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(null);

  const locationPermission = localStorage.getItem(`locationPermission_${JSON.parse(localStorage.getItem("loggedInUser"))?.userId}`);
  const cameraPermission = localStorage.getItem(`cameraPermission_${JSON.parse(localStorage.getItem("loggedInUser"))?.userId}`);

  // Function to handle overlay clicks
  const handleOverlayClick = (e) => {
    e.stopPropagation();
  };

  const validateInputs = useCallback(() => {
    const errors = {};
    const descriptionEmpty = formData.description.trim() === "";
    const locationEmpty = formData.location.address.trim() === "";
    const imagesEmpty = formData.images.length === 0;

    const emptyFieldsCount = [descriptionEmpty, locationEmpty, imagesEmpty].filter(Boolean).length;

    if (emptyFieldsCount === 3) {
      errors.general = "Missing: description, location, image. Please provide to continue";
    } else if (emptyFieldsCount === 2 || emptyFieldsCount === 1) {
      if (emptyFieldsCount === 2) {
        errors.general = "Error: Incomplete Information Provided";
      } else {
        if (descriptionEmpty) errors.description = "It seems you're missing: Description. Please provide it to continue";
        if (locationEmpty) errors.location = "It seems you're missing: Location. Please provide it to continue";
        if (imagesEmpty) errors.images = "It seems you're missing: Image. Please provide it to continue";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleBack = useCallback(() => {
    setIsVisible(false);
    navigate("/wsreport");
  }, [navigate]);

  const onPopUpReportClick = useCallback(() => {
    if (validateInputs()) {
      setShowPopUpConfirm(true);
    }
  }, [validateInputs]);

  const fetchSuggestions = async (input) => {
    try {
      const response = await axios.get(`/api/suggestions?input=${input}`);
      console.log("Suggestions response:", response.data);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const getCurrentWord = (text, position) => {
    const left = text.slice(0, position).search(/\S+$/);
    const right = text.slice(position).search(/\s/);
    return text.slice(left, right + position);
  };

  const handleDescriptionChange = (e) => {
    const inputValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setFormData((prev) => ({ ...prev, description: inputValue }));
    setCursorPosition(cursorPos);

    const currentWord = getCurrentWord(inputValue, cursorPos);
    if (currentWord.length > 2) {
      fetchSuggestions(currentWord);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const words = formData.description.split(/\s+/);
    const index = formData.description.slice(0, cursorPosition).split(/\s+/).length - 1;
    words[index] = suggestion;

    setFormData((prev) => ({
      ...prev,
      description: words.join(" "),
    }));
    setShowSuggestions(false);
    setActiveSuggestionIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      setActiveSuggestionIndex((prevIndex) =>
        prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1
      );
      document.querySelector(".suggestion-list li.active")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    } else if (e.key === "ArrowUp") {
      setActiveSuggestionIndex((prevIndex) =>
        prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1
      );
      document.querySelector(".suggestion-list li.active")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestionIndex]);
    }
  };

  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchLocationDetails(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setFormData((prev) => ({
            ...prev,
            location: { address: "Unable to get location", latitude: null, longitude: null },
          }));
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const fetchLocationDetails = async (latitude, longitude) => {
    try {
      const response = await axios.get(`/api/locations/check-location?latitude=${latitude}&longitude=${longitude}`);
      const nearestBuilding = response.data;

      if (nearestBuilding === "Outside Campus") {
        setShowOutsideCampusWarning(true);
        setFormData((prev) => ({
          ...prev,
          location: { address: "Outside Campus", latitude, longitude },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          location: { address: nearestBuilding, latitude, longitude },
        }));
      }
    } catch (error) {
      console.error("Error getting location details:", error);
      setFormData((prev) => ({
        ...prev,
        location: { address: "Error getting location", latitude: null, longitude: null },
      }));
    }
  };

  const handleConfirmSubmit = useCallback(async () => {
    if (!validateInputs()) return;

    setIsSubmitting(true);

    try {
      const { description, location, images } = formData;
      const userId = localStorage.getItem("loggedInUser")
        ? JSON.parse(localStorage.getItem("loggedInUser")).userId
        : null;

      if (!userId) {
        throw new Error("User is not logged in");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("description", description);
      formDataToSend.append("buildingName", location.address);

      if (location.latitude !== null) {
        formDataToSend.append("latitude", location.latitude);
      }
      if (location.longitude !== null) {
        formDataToSend.append("longitude", location.longitude);
      }

      formDataToSend.append("userId", userId);

      images.forEach((img, index) => {
        formDataToSend.append(`image${index + 1}`, img.file);
      });

      await axios.post("/api/user/reports/submit", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowSuccessMessage(true);
      setIsSubmitting(false);
      setShowPopUpConfirm(false);

      setTimeout(() => {
        onClose();
        navigate("/wsreport");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setBackendValidationMessage(error.response.data);
        setShowBackendValidationWarning(true);
      } else {
        console.error("Error submitting report:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
      setIsSubmitting(false);
    }
  }, [formData, navigate, validateInputs, onClose]);

  const handleLocationChange = (event) => {
    const selectedLocation = event.target.value;
    setFormData((prev) => ({
      ...prev,
      location: { address: selectedLocation, latitude: null, longitude: null },
    }));
  };

  const handleChooseLocation = () => {
    if (locationPermission === "never") {
      onLocationRetry();
    } else {
      getUserLocation();
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = 3 - formData.images.length;

    if (files.length > remainingSlots) {
      setShowImageLimitWarning(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > 2 * 1024 * 1024) {
      setShowFileSizeWarning(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const newImages = files.map((file) => ({
      file,
      path: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((image) => image.id !== id) }));
  };

  const handleCameraClick = () => {
    if (formData.images.length >= 3) {
      setShowImageLimitWarning(true);
    } else if (cameraPermission === "never") {
      // Do nothing, since the user denied camera permission
    } else {
      setShowCamera(true);
    }
  };

  const handleCaptureImage = (image) => {
    if (formData.images.length >= 3) {
      setShowImageLimitWarning(true);
      setShowCamera(false);
      return;
    }

    const uniqueFileName = `capture-${Date.now()}.png`;
    const newImage = {
      file: dataURLtoFile(image, uniqueFileName),
      path: URL.createObjectURL(dataURLtoFile(image, uniqueFileName)),
      id: Date.now() + Math.random(),
    };
    setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }));
    setShowCamera(false);
  };

  function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };

  if (!isVisible) return null;

  return (
    <div
      className="popup-overlay"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="PopUpReportFinalPage" onClick={(e) => e.stopPropagation()}>
        <div className="Description-Container">
          <b className="t-name">Description</b>
          <textarea
            className={`Description-Input ${validationErrors.description ? "error" : ""}`}
            value={formData.description}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            placeholder="What happened?"
            rows="5"
          />
          {showSuggestions && (
            <ul className="suggestion-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={index === activeSuggestionIndex ? "active" : ""}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="Location-Container">
          <b className="t-name">Location</b>
          {locationPermission === "never" ? (
            <FormControl fullWidth>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={formData.location.address}
                onChange={handleLocationChange}
                className={`Location-Input ${validationErrors.location ? "error" : ""}`}
                displayEmpty
                renderValue={formData.location.address !== "" ? undefined : () => "Where it happened?"}
                sx={{
                  "&:focus-within .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8A252C",
                  },
                  "& .MuiSelect-icon": {
                    right: "10px",
                  },
                }}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.name} value={loc.name}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <input
              className={`Location-Input ${validationErrors.location ? "error" : ""}`}
              value={formData.location.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: { ...prev.location, address: e.target.value } }))}
              placeholder="Where it happened?"
            />
          )}
        </div>

        {locationPermission !== "never" && (
          <img className="Choose-Location" alt="" src="/r-location.png" onClick={handleChooseLocation} />
        )}

        <div className="Upload-Photo-Container">
          <b>Upload photo</b>
          <span className="for-evidence"> (For evidence, max 2MB total)</span>
        </div>

        <div className="Camera-Container" onClick={handleCameraClick}>
          <div className="bg-container" />
          <div className="n-camera">Camera</div>
          <img className="bicamera-icon" alt="" src="/cam2.png" style={{ opacity: cameraPermission === "never" ? 0.5 : 1 }} />
        </div>

        <div className="Upload-Container">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".jpg, .jpeg"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <label htmlFor="file-upload" className="bg-container">
            <div className="n-upload">Upload file</div>
            <img className="symbolupload-icon" alt="" src="/upload-icon.png" />
          </label>
        </div>

        <div className="Image-Preview-Container">
          {formData.images.map((image) => (
            <div key={image.id} className="Image-Preview" onClick={() => handleImageClick(image.path)}>
              <img src={image.path} alt={`Preview ${image.id}`} />
              <button onClick={() => removeImage(image.id)} className="remove-image-button">
                X
              </button>
            </div>
          ))}
        </div>

        <Button
          className="ReportFinal-next-button"
          variant="contained"
          sx={{
            position: "absolute",
            top: "570px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "10px",
            width: 165,
            height: 40,
            backgroundColor: "#8A252C",
            transition: "all 0.3s ease",
            "&:hover, &:active": {
              backgroundColor: "#A91D3A",
              transform: "translateX(-50%) scale(1.05)",
            },
            "@media (max-width: 500px)": {
              width: 140,
              height: 36,
            },
          }}
          onClick={onPopUpReportClick}
        >
          <span style={{ fontSize: "15px" }}>NEXT</span>
        </Button>

        {Object.keys(validationErrors).length > 0 && (
          <div className="validation-errors-container">
            {validationErrors.general ? (
              <div className="error-message-1">{validationErrors.general}</div>
            ) : (
              <>
                {validationErrors.description && <div className="error-message">{validationErrors.description}</div>}
                {validationErrors.location && <div className="error-message">{validationErrors.location}</div>}
                {validationErrors.images && <div className="error-message">{validationErrors.images}</div>}
              </>
            )}
          </div>
        )}

        <div className="back-button-containerFR" onClick={handleBack}>
          <div className="back-bgFR" />
          <img className="back-iconFR" alt="Back" src="/back.png" />
        </div>
      </div>

      {showImageLimitWarning && <ImageLimitWarningModal onClose={() => setShowImageLimitWarning(false)} />}
      {showFileSizeWarning && <FileSizeWarningModal onClose={() => setShowFileSizeWarning(false)} />}
      {showCamera && <CameraModal onCapture={handleCaptureImage} onClose={() => setShowCamera(false)} />}
      {showPopUpConfirm && <PopUpConfirm onClose={() => setShowPopUpConfirm(false)} onSubmit={handleConfirmSubmit} />}
      {showSuccessMessage && (
        <Snackbar open={showSuccessMessage} autoHideDuration={3000} onClose={() => setShowSuccessMessage(false)}>
          <Alert onClose={() => setShowSuccessMessage(false)} severity="success" sx={{ width: "100%" }}>
            Report submitted successfully!
          </Alert>
        </Snackbar>
      )}
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Submitting your report, please wait...</p>
        </div>
      )}

      <Dialog open={!!selectedImage} onClose={handleCloseImagePreview}>
        <DialogContent>
          <IconButton
            style={{ position: "absolute", top: 10, right: 10, backgroundColor: "white" }}
            onClick={handleCloseImagePreview}
          >
            &times;
          </IconButton>
          {selectedImage && <img src={selectedImage} alt="Enlarged Preview" style={{ width: "100%", height: "auto" }} />}
        </DialogContent>
      </Dialog>

      {showOutsideCampusWarning && <OutsideCampusWarningModal onClose={() => setShowOutsideCampusWarning(false)} />}
      {showBackendValidationWarning && (
        <BackendValidationWarningModal message={backendValidationMessage} onClose={() => setShowBackendValidationWarning(false)} />
      )}
    </div>
  );
};

export default PopUpReportFinal;
