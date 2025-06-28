import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/joinus.css";

const JoinUsSection = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate("/auth", { state: { signup: true } });
  };

const handleDonateClick = () => {
  navigate("/add-donation");
};


  return (
    <div className="join-us-section">
      <div className="join-us-overlay"></div>
      <div className="join-us-content">
        {!user ? (
          <>
            <h2>خيراتك تصنع فرقًا جنبنا ❤️</h2>
            <p>Your donations help others in need.</p>
            <button onClick={handleJoinClick}>Join Us</button>
          </>
        ) : (
          <>
            <p className="welcome-message">
              We’re lucky to have you on our team 💙
            </p>
            <button onClick={handleDonateClick}>Donate Now</button>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinUsSection;
