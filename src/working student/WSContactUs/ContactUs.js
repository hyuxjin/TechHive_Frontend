import { useState, useCallback } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import "./ContactUs.css";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
    createdAt: new Date().toISOString()
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      createdAt: new Date().toISOString()
    };
    try {
      const response = await axios.post('/contact', updatedFormData);
      if (response.status === 200) {
        setModalMessage("Message sent successfully");
        setIsError(false);
        setModalOpen(true);
        setFormData({ name: "", email: "", phoneNumber: "", message: "", createdAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setModalMessage("There was an error submitting your message. Please try again.");
      setIsError(true);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onGETSTARTEDTextClick = useCallback(() => {
    navigate("/wslandingpage");
  }, [navigate]);

  return (
    <div className="ws-contact-us">
      <img className="background" alt="" src="/bg1.png" />
      <div className="main-box" />
      <img className="wildcat-cuteC" alt="" src="/wildcat-icon.png" />
      <div className="get-started" onClick={onGETSTARTEDTextClick}>
        GET STARTED
      </div>
      <b className="ContactUs-title">CONTACT US</b>
      <i className="cinfo">We're here to help you</i>
      <div className="phone">PHONE</div>
      <div className="phone-num">+63 920 1988</div>
      <div className="phone-bg" />
      <img className="phone-icon" alt="" src="/phone.png" />
      <div className="email">EMAIL</div>
      <div className="email-mail">wildcatonetap@gmail.com</div>
      <div className="email-bg" />
      <img className="email-icon" alt="" src="/email.png" />
      <div className="location">LOCATION</div>
      <div className="location-name">Cebu Institute of Technology - University</div>
      <div className="location-bg" />
      <img className="location-icon" alt="" src="/location.png" />
     
      <b className="Lets-title">LET'S TALK</b>
      <i className="feel-free-to">Feel free to drop us a line below!</i>
      
      <form onSubmit={handleSubmit}>
        <input 
          className="ynInput" 
          type="text" 
          placeholder="Your name" 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input 
          className="eInput" 
          type="email" 
          placeholder="Email" 
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input 
          className="pnInput" 
          type="tel" 
          placeholder="Phone number" 
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
        <textarea 
          className="mInput" 
          placeholder="Message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
        ></textarea>
        
        <Button
          className="submit-button"
          variant="contained"
          type="submit"
          sx={{ 
            borderRadius: "10px",
            width: 90,
            height: 30,
            backgroundColor: "#8A252C",
            transition: "transform 0.3s ease, background-color 0.3s ease",
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "#B02644", 
              transform: "scale(1.05)", 
            }
          }}
        >
          SUBMIT
        </Button>
      </form>

      {modalOpen && (
        <div className="modal-overlay">
          <div className={`modal-content ${isError ? 'error' : 'success'}`}>
            <h2>{isError ? 'Error' : 'Success!'}</h2>
            <p>{modalMessage}</p>
            <Button
    onClick={closeModal}
    sx={{ 
        fontFamily: 'var(--font-montserrat)',
        backgroundColor: "#8a252c",
        color: "white",
        '&:hover': {
            backgroundColor: "#f9d67b",
            color: "#8a252c"
        }
    }}
>
    Close
</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;