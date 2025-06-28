import React, { useEffect, useState } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DonationCard from "../components/DonationCard";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const categories = [
  { id: "all", label: "All" },

  { id: "clothes", label: "Clothes" },
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "food", label: "Food" },
  { id: "other", label: "Other" },
];

const Donations = () => {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const [selectedkind, setSelectedkind] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [donations, setDonations] = useState([]);

  const locations = [
    "Amman", "Irbid", "Zarqa", "Aqaba", "Ajloun", "Jerash",
    "Mafraq", "Balqa", "Karak", "Tafilah", "Ma'an", "Madaba"
  ];

  useEffect(() => {
    const fetchDonations = async () => {
      const res = await axios.get("/donations");
      const valid = res.data.filter(
        (d) => d.isValid === undefined || d.isValid === true || d.isValid === "true"
      );
      setDonations(valid);
    };
    fetchDonations();
  }, [locationHook]);

  const filteredDonations = donations.filter((donation) => {
    const matchesKind = selectedkind === "all" || donation.kind?.toLowerCase() === selectedkind;
    const matchesSearch = donation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          donation.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !location || donation.location?.toLowerCase().includes(location.toLowerCase());
    return matchesKind && matchesSearch && matchesLocation;
  });

  return (
    <div className="main-content">
      <div className="container-fluid py-4">
        <div className="bg-white p-4 rounded shadow-sm mb-5">
          <div className="row g-3">
            <div className="col-md-6 position-relative p-2">
              <Search className="position-absolute top-50 translate-middle-y ms-2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search donations..."
                className="custom-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="col-md-6 position-relative p-2">
              <MapPin className="position-absolute top-50 translate-middle-y ms-2 text-muted" size={16} />
             <select
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  className="custom-select"
>
  <option value="">All Locations</option>
  {locations.map((loc) => (
    <option key={loc} value={loc.toLowerCase()}>
      {loc}
    </option>
  ))}
</select>

            
            </div>

            <div className="col-12 d-flex align-items-center flex-wrap gap-2 mt-2">
              <Filter className="text-muted" size={20} />
              {categories.map((kind) => (
                <button
                  key={kind.id}
                  onClick={() => setSelectedkind(kind.id)}
                  className={`filter-btn ${selectedkind === kind.id ? "active" : ""}`}
                >
                  {kind.label}
                </button>
              ))}
            </div>
          </div>
        </div>

       <div className="donations-grid">
          {filteredDonations.map((donation) => (
            <DonationCard key={donation._id} donation={donation} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Donations;
