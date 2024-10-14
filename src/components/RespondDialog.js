import React, { useRef } from "react";
import Modal from "react-modal";
import BackIcon from "../assets/image/back.png";
import "./RespondDialog.css";
import ConfirmationDialog from "./ConfirmationDialog";

const RespondDialog = () => {
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
    <div className="respond-btn">
      <button  onClick={openModal}>
        Respond
      </button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={closeModal} className="closebtn-design">
          <img src={BackIcon} alt="Back" />
        </button>
        <div ref={subtitleRef}></div>
        <div className="entrychecking-container">
          <h4>Approval Decision</h4>
          <div className="approval-design">
            <div>
              <input
                type="checkbox"
                id="approve"
                name="approve"
                value="approve"
              />{" "}
              <label for="approve">Approve</label>
            </div>
            <div>
              <input type="checkbox" id="deny" name="deny" value="deny" />{" "}
              <label for="deny">Deny</label>
            </div>
          </div>
        </div>
        <div className="entrychecking-container">
          <h4>Verification Desicion</h4>
          <div className="approval-design">
            <div>
              <input type="checkbox" id="verify" name="verify" value="verify" />{" "}
              <label for="verify">Verify</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="unverify"
                name="unverify"
                value="unverify"
              />{" "}
              <label for="unverify">Unverify</label>
            </div>
          </div>
        </div>
        <div className="publish-btn">
          <ConfirmationDialog />
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
    backgroundImage:
      "linear-gradient(0deg, hsl(43deg 91% 73%) 0%, hsl(49deg 88% 80%) 50%, hsl(58deg 93% 89%) 100%)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
};

export default RespondDialog;
