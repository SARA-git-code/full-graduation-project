import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThankYouModal from "../components/ThankYouModal";

import "../styles/addDonation.css"; // تأكد أن هذا الملف يحتوي على التنسيقات الجديدة

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const DonationForm = ({ mode = "add", donation = null }) => {
  const [title, setTitle] = useState("");
  const [kind, setkind] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [expirationDate, setExpirationDate] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const navigate = useNavigate();

  const governorates = [
    "Amman",
    "Irbid",
    "Zarqa",
    "Aqaba",
    "Ajloun",
    "Jerash",
    "Mafraq",
    "Balqa",
    "Karak",
    "Tafilah",
    "Ma'an",
    "Madaba",
  ];

  useEffect(() => {
    if (mode === "edit" && donation) {
      setTitle(donation.title);
      setkind(donation.kind);
      setDescription(donation.description);
      setLocation(donation.location?.trim() || "");
      setCondition(donation.condition);
      setExpirationDate(donation.expirationDate || "");
      setExistingImages(
        (donation.images || []).map((img) => ({
          preview: `http://localhost:5050/uploads/${img}`,
          fileName: img,
        }))
      );
    }
  }, [mode, donation]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.name.match(/\.(jpg|jpeg|png|gif)$/i)
    );
    const readers = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ file, preview: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setImages((prev) => [...prev, ...results]);
      setNewImages((prev) => [...prev, ...results]);
    });
  };

  const removeOldImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("kind", kind);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("condition", condition);
      formData.append(
        "existingImages",
        JSON.stringify(existingImages.map((img) => img.fileName))
      );

      if (kind === "food") {
        if (!expirationDate) {
          alert("Please provide an expiration date for food donations.");
          return;
        }
        formData.append("expireDate", expirationDate);
      }

      newImages.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      if (mode === "edit") {
        await axios.put(`/donations/${donation._id}`, formData);
        alert("Donation updated successfully!");
        navigate(`/donations/${donation._id}`);
      } else {
        await axios.post("/donations", formData);
        setShowThankYou(true);
      }
    } catch (err) {
      console.error("❌ Failed to submit donation:", err.message);
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-page">
      <div className="container my-auto">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="donation-form">
              <h2>{mode === "add" ? "Add New Donation" : "Edit Donation"}</h2>
              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Kind */}
                <div className="mb-3">
                  <label className="form-label">Kind</label>
                  <select
                    className="form-select"
                    value={kind}
                    onChange={(e) => setkind(e.target.value)}
                    required
                  >
                    <option value="">Select a kind</option>
                    <option value="clothes">Clothes</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Expiration Date for food */}
                {kind === "food" && (
                  <div className="mb-3">
                    <label className="form-label">Expiration Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Condition */}
                <div className="mb-3">
                  <label className="form-label">Condition</label>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="new"
                      name="condition"
                      value="new"
                      checked={condition === "new"}
                      onChange={(e) => setCondition(e.target.value)}
                      required
                    />
                    <label className="form-check-label" htmlFor="new">
                      New
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="used"
                      name="condition"
                      value="used"
                      checked={condition === "used"}
                      onChange={(e) => setCondition(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="used">
                      Used
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Location */}
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <select
                    className="form-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  >
                    {location && !governorates.includes(location) && (
                      <option value={location} hidden>
                        {location}
                      </option>
                    )}

                    <option value="">Select a location</option>
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="form-label">Images</label>
                  <div
                    className="upload-box"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <Upload />
                    <p>Click or drag files to upload</p>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="d-none"
                    />
                  </div>

                  <div className="preview-container">
                    {existingImages.map((img, index) => (
                      <div key={`old-${index}`} className="image-preview">
                        <img src={img.preview} alt="Old preview" />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger remove-btn"
                          onClick={() => removeOldImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {newImages.map((img, index) => (
                      <div key={`new-${index}`} className="image-preview">
                        <img src={img.preview} alt="New preview" />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger remove-btn"
                          onClick={() => removeNewImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : mode === "add"
                    ? "Save Donation"
                    : "Update Donation"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ThankYouModal
        isOpen={showThankYou}
        onClose={() => {
          setShowThankYou(false);
          navigate("/donations");
        }}
      />
    </div>
  );
};

export default DonationForm;
