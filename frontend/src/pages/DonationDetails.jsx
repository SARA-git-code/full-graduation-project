import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, MapPin, Calendar, Tag, Info, User } from "lucide-react";
import axios from "axios";
import { getOrCreateConversation } from "../api";
import DonationCard from "../components/DonationCard";
import { useUserContext } from "../context/UserContext"; // مهم لاستخدام بيانات المستخدم

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const formatTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  const now = new Date();
  const created = new Date(createdAt);
  const diff = Math.floor((now - created) / 1000);
  const minute = 60,
    hour = 3600,
    day = 86400,
    week = 604800;

  if (diff < minute) return `${diff} second(s) ago`;
  if (diff < hour) return `${Math.floor(diff / minute)} minute(s) ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hour(s) ago`;
  if (diff < week) return `${Math.floor(diff / day)} day(s) ago`;
  return created.toLocaleDateString("en-GB");
};

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext(); // جلب المستخدم الحالي
  const [donation, setDonation] = useState(null);
  const [related, setRelated] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
useEffect(() => {
  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100); // ⏱ تأخير بسيط بعد تحميل المحتوى
  };
  scrollToTop();
}, [id]);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        console.log("🔍 Fetching donation by ID:", id); 
        const res = await axios.get(`/donations/${id}`);
        setDonation(res.data);

        const all = await axios.get("/donations");
        const others = all.data.filter(
          (d) => d._id !== id && d.kind === res.data.kind
        );
        setRelated(others);
      } catch (err) {
        console.error("❌ Failed to load donation:", err.message);
        navigate("/donations");
      }
    };
    fetchDonation();
  }, [id, navigate]);

  useEffect(() => {
    let interval;
    if (hovered && donation?.images?.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % donation.images.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [hovered, donation]);

  if (!donation) return <p className="text-center mt-5">Loading...</p>;

  const images = donation.images?.length
    ? donation.images
    : ["https://via.placeholder.com/600x300?text=No+Image"];

  const isOwner = user && user._id === donation.user?._id;

  return (
       <div className="main-content">
    <div className="container py-5">
      <div className="row g-4 align-items-start">
        {/* Image */}
        <div className="col-md-6">
        <div
  className="position-relative bg-dark rounded overflow-hidden"
  style={{ height: "400px" }}
>
  {/* زر يسار */}
  {images.length > 1 && (
    <button
      className="btn btn-sm btn-light position-absolute top-50 start-0 translate-middle-y"
      style={{ zIndex: 3 }}
      onClick={() =>
        setImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        )
      }
    >
      ◀
    </button>
  )}

  {/* زر يمين */}
  {images.length > 1 && (
    <button
      className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y"
      style={{ zIndex: 3 }}
      onClick={() =>
        setImageIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1
        )
      }
    >
      ▶
    </button>
  )}

  {/* الصور */}
  {images.map((img, idx) => (
    <img
      key={idx}
      src={img.startsWith("http") ? img : `http://localhost:5050/uploads/${img}`}
      alt={`slide-${idx}`}
      className="w-100 position-absolute top-0 start-0"
      style={{
        height: "400px",
        objectFit: "cover",
        opacity: imageIndex === idx ? 1 : 0,
        transition: "opacity 1s ease-in-out",
        zIndex: imageIndex === idx ? 2 : 1,
      }}
    />
  ))}
</div>

        </div>

        {/* Info */}
        <div className="col-md-6">
          <h2 className="fw-bold mb-3" style={{ fontSize: "2rem", color: "#6225e6" }}>
            {donation.title}
          </h2>

          {donation.user?.name && (
            <div className="mb-3 d-flex align-items-center text-muted">
              <User size={20} className="me-2" />
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {donation.user.name}
              </span>
            </div>
          )}

          <small className="text-muted d-block mb-3" style={{ fontSize: "1rem" }}>
            🕒 Posted {formatTimeAgo(donation.createdAt)}
          </small>

          <div className="mb-2 text-muted"><Tag className="me-2" size={18} /> {donation.kind}</div>
          <div className="mb-2 text-muted"><MapPin className="me-2" size={18} /> {donation.location}</div>

          {donation.condition && (
            <div className="mb-3 text-muted"><Info className="me-2" size={18} /> Condition: {donation.condition}</div>
          )}

          {/* Description Box with scroll */}
          <div
            className="mb-4 text-secondary"
            style={{
              fontSize: "1.1rem",
              maxHeight: "4.5em",
              overflowY: "auto",
              padding: "0.75rem 1rem",
              background: "#f8f8f8",
              borderRadius: "8px",
              lineHeight: "1.5",
              border: "1px solid #ddd",
            }}
          >
            {donation.description}
          </div>

          {/* Contact Donor Button */}
          {!isOwner && (
            <button
              className="cta"
              onClick={async () => {
                try {
                  await getOrCreateConversation(donation.user._id);
                  navigate(`/chat/${donation.user._id}`);
                } catch (err) {
                  console.error("❌ Failed to start chat:", err);
                  alert("Could not start chat. Please try again.");
                }
              }}
            >
              <span className="span">Contact Donor</span>
              <span className="second">
                <svg width="50px" height="20px" viewBox="0 0 66 43" version="1.1">
                  <g id="arrow" fill="none" fillRule="evenodd">
                    <path className="one" fill="#fff" d="M40.15,3.89 ...Z" />
                    <path className="two" fill="#fff" d="M20.15,3.89 ...Z" />
                    <path className="three" fill="#fff" d="M0.15,3.89 ...Z" />
                  </g>
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Related Donations */}
      {related.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-4">More in "{donation.kind}"</h4>
          <div className="row g-4">
            {related.map((item) => (
              <div key={item._id} className="col-md-4">
                <DonationCard donation={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default DonationDetails;
