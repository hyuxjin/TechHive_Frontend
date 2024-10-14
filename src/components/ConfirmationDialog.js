import React, { useRef } from "react";
import Modal from "react-modal";
import "./ConfirmationDialog.css";
import WildCatPublish from "../assets/image/wildpublish.png";
import PublishSuccessfulDialog from "./PublishSuccessfulDialog";

const ConfirmationDialog = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const subtitleRef = useRef(null);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    if (subtitleRef.current) {
      subtitleRef.current.style.color = "#f00";
    }
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div className="modal-container">
      <button className="publish-btn" onClick={openModal}>PUBLISH</button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >

        <div className="confirmation-container">
          <h4>Are you sure you want to publish?</h4>
          <img src={WildCatPublish}/>
          <div className="confirmation-btn">
            <PublishSuccessfulDialog/>
            <button>CANCEL</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundImage: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
};

export default ConfirmationDialog;
