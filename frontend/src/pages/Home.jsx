import  { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import StatsCarousel from "../components/StatsCarousel";
import CoverflowSlider from "../components/CoverflowSlider";
import DonationCard from "../components/DonationCard";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JoinUsSection from "../components/JoinUsSection";

import "../index.css";
import leftHand from "../assets/leftHand.png";
import rightHand from "../assets/rightHand.png";

const Home = () => {
  const [mostInterested, setMostInterested] = useState([]);
  const scrollRef = useRef();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // ✅ حركة اليدين يمين ويسار عند التمرير

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const leftShift = Math.min(scrollY * -0.3, -100); // لا تزيد الحركة كثيرًا
  const rightShift = Math.min(scrollY * 0.3, 100);

  // ✅ التمرير التلقائي إلى القسم المحدد في الرابط (مثل #about)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  // ✅ جلب التبرعات الأكثر اهتمامًا
  useEffect(() => {
    axios
      .get("/donations/most-interested")
      .then((res) => setMostInterested(res.data))
      .catch((err) =>
        console.error("❌ Failed to fetch most interested:", err)
      );
  }, []);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="main-content">
      <section className="hero-section">
        <img
          src={leftHand}
          alt="Left Hand"
          className="left-hand"
          style={{ transform: `translateX(${leftShift}px)` }}
        />
        <img
          src={rightHand}
          alt="Right Hand"
          className="right-hand"
          style={{ transform: `translateX(${rightShift}px)` }}
        />
        <h1 className="hero-title">Give & Gather</h1>
      </section>

      <div className="section-transition"></div>

      {/* ✅ قسم "عن الموقع" بمُعرّف ثابت */}
      <section id="about">
        <CoverflowSlider />
      </section>

      <section style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h2 className="m-title">Most Interested</h2>
        <div className="position-relative">
          <button
            className="btn btn-light position-absolute top-50 start-0 translate-middle-y z-2"
            style={{ boxShadow: "0 0 6px rgba(0,0,0,0.2)" }}
            onClick={() => scroll("left")}
          >
            <ChevronLeft />
          </button>
          <div
            ref={scrollRef}
            className="d-flex overflow-auto gap-3 px-4 py-3"
            style={{
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {mostInterested.map((donation) => (
              <div
                key={donation._id}
                className="flex-shrink-0"
                style={{
                  width: "300px",
                  height: "400px",
                  scrollSnapAlign: "start",
                }}
                onClick={() => {
                  if (!currentUser) {
                    navigate("/auth");
                  } else {
                    navigate(`/donations/${donation._id}`);
                  }
                }}
              >
                <DonationCard donation={donation} />
              </div>
            ))}
          </div>
          <button
            className="btn btn-light position-absolute top-50 end-0 translate-middle-y z-2"
            style={{ boxShadow: "0 0 6px rgba(0,0,0,0.2)" }}
            onClick={() => scroll("right")}
          >
            <ChevronRight />
          </button>
        </div>
      </section>

      <div className="position-relative min-vh-100 w-100 d-flex align-items-center justify-content-center bg-white">
        <StatsCarousel />
      </div>
    </div>
  );
};

export default Home;
