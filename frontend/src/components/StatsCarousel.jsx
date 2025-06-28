import { useEffect, useState, useRef } from "react";
import { Gift, Users, Heart } from "lucide-react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5050/api"; 
axios.defaults.withCredentials = true;
import "../styles/statsCarousel.css"; 

const StatsCarousel = () => {
  const [statsData, setStatsData] = useState({ items: 0, users: 0, impact: 0 });
  const [startCounting, setStartCounting] = useState(false);
  const sectionRef = useRef();

  // 👁️ تفعيل العد فقط عند ظهور القسم على الشاشة
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) setStartCounting(true);
      },
      { threshold: 0.9 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 🔢 تحميل البيانات من السيرفر
  useEffect(() => {
    axios
      .get("/stats")
      .then((res) => setStatsData(res.data))
      .catch((err) => console.error("❌ Failed to load stats", err.message));
  }, []);

  // 🎯 دالة العد التصاعدي التدريجي
  const useCounter = (end) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (!startCounting) return;
      let start = 0;
      const duration = 1500;
      const increment = Math.ceil(end / (duration / 20));
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 20);
      return () => clearInterval(interval);
    }, [end, startCounting]);
    return count;
  };

  // 🧮 تعريف الإحصائيات
  const stats = [
    {
      icon: <Gift className="text-primary" size={40} />,
      value: useCounter(statsData.items),
      subtitle: "Items Donated",
    },
    {
      icon: <Users className="text-primary" size={40} />,
      value: useCounter(statsData.users),
      subtitle: "Active Members",
    },
    {
      icon: <Heart className="text-primary" size={40} />,
      value: useCounter(statsData.impact),
      subtitle: "Lives Impacted",
    },
  ];

  return (
    <section className="my-5 text-center" ref={sectionRef}>
      <div className="container">
        <div className="row justify-content-center">
          {stats.map((stat, index) => (
            <div key={index} className="col-md-6 col-lg-4 px-4 mb-5">
              <div
                className="cbg rounded shadow-sm mx-auto transition-all hover:shadow-lg"
                style={{
                  padding: "120px 80px",
                  maxWidth: "100%",
                  minHeight: "500px",
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#fcfefe",
                  }}
                >
                  {stat.icon}
                </div>
                <h3 className="display-5 fw-bold">{stat.value}+</h3>
                <p className="fs-5 text-muted">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCarousel;
