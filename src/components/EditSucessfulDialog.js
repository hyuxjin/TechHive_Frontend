import React, { useRef } from "react";
import Modal from "react-modal";
import "./PublishSuccessfulDialog.css";
import WildLike from "../assets/image/wildlike.png";

const EditSuccessfulDialog = () => {
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
      <button
        style={{
          backgroundColor: "#9f4c4a",
          width: "107px",
          height: "39px",
          borderRadius: "10px",
          fontWeight: "500",
        }}
        onClick={openModal}
      >
        Update
      </button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className="successful-container">
          <h4>Your password has been updated</h4>
          <img src={WildLike} alt="like"/>
          <div className="successful-btn">
            <button>OK</button>
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

export default EditSuccessfulDialog;
