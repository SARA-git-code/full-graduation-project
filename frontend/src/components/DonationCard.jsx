import { Bookmark, MapPin, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../context/UserContext"; // ⬅️ ضروري جدًا
import { useLayoutEffect } from "react";
axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const formatTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffInSeconds = Math.floor((now - createdDate) / 1000);
  const minute = 60, hour = 60 * minute, day = 24 * hour, week = 7 * day;

  if (diffInSeconds < minute) return `${diffInSeconds} second(s) ago`;
  if (diffInSeconds < hour) return `${Math.floor(diffInSeconds / minute)} minute(s) ago`;
  if (diffInSeconds < day) return `${Math.floor(diffInSeconds / hour)} hour(s) ago`;
  if (diffInSeconds < week) return `${Math.floor(diffInSeconds / day)} day(s) ago`;
  return createdDate.toLocaleDateString("en-GB");
};

const DonationCard = ({ donation }) => {
  const navigate = useNavigate();
  const { user } = useUserContext(); // ✅
  const [isSaved, setIsSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const res = await axios.get("/saved");
        const savedIds = res.data.map((d) => d._id);
        setIsSaved(savedIds.includes(donation._id));
      } catch (err) {
        console.error("❌ Failed to check saved:", err.message);
      }
    };
    checkSaved();
  }, [donation._id]);

  useEffect(() => {
    let interval;
    if (hovered && donation.images?.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % donation.images.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [hovered, donation.images]);

  if (!donation || !donation.title || !donation.images?.length) {
    console.warn("⛔️ Skipping card, missing title or images:", donation);
    return null;
  }

  const currentImage = donation.images[imageIndex];
  let imageUrl = "/assets/noImage.png";
  if (typeof currentImage === "string") {
    const cleaned = currentImage.trim();
    imageUrl = cleaned.startsWith("http")
      ? cleaned
      : `http://localhost:5050/uploads/${cleaned}`;
  }

  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        await axios.delete(`/saved/${donation._id}`);
      } else {
        await axios.post(`/saved/${donation._id}`, {});
      }
      setIsSaved(!isSaved);
    } catch (err) {
      alert("Failed to update saved status");
    }
  };

  return (
    <div
      className="card h-100 w-100 position-relative"
      onClick={() => {
        if (!user) return navigate("/auth"); // ✅ حماية
        navigate(`/donations/${donation._id}`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setImageIndex(0);
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
        <Bookmark
          size={20}
          color={isSaved ? "#007bff" : "#aaa"}
          fill={isSaved ? "#007bff" : "none"}
          style={{ cursor: "pointer" }}
          onClick={toggleSave}
        />
      </div>

      <div style={{ height: "200px", width: "100%", overflow: "hidden" }}>
        <img
          className="donation-img"
          src={imageUrl}
          alt={donation.title || "Donation Image"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/noImage.png";
          }}
        />
      </div>

      <div className="card-body d-flex flex-column bg-white">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-primary text-light text-capitalize px-3 py-1 rounded-pill">
            {donation.kind}
          </span>
          <small className="text-muted">{formatTimeAgo(donation.createdAt)}</small>
        </div>

        <h5 className="card-title mb-2 fw-semibold">{donation.title}</h5>

        <div className="d-flex align-items-center text-muted small mb-3">
          <MapPin size={14} className="me-1" />
          <span>{donation.location}</span>
        </div>

        <button
          type="button"
          className="btn-animated mt-auto d-flex align-items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            if (!user) return navigate("/auth");

            navigate(`/donations/${donation._id}`);

            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 300);
          }}
        >
          <span>View Details</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DonationCard;
