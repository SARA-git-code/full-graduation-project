import React, { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Calendar,
  Pencil,
  MessageSquare,
  MoreVertical,
  Trash2,
  Flag,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../context/UserContext";
import "../styles/profile.css";

axios.defaults.baseURL = "http://localhost:5050/api";
axios.defaults.withCredentials = true;

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [backgroundImage, setBackgroundImage] = useState(
    "/src/assets/relax.png"
  );
  const [userDonations, setUserDonations] = useState([]);
  const [savedDonations, setSavedDonations] = useState([]);
  const { id } = useParams();
  const isOwnProfile = !id;
  const { fetchUser, currentUser } = useUserContext();
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const getImageName = (url) => {
    if (!url) return "";
    const parts = url.split("/uploads/");
    return parts.length === 2 ? parts[1] : "";
  };

  const handleMessageClick = () => navigate("/chat");

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedProfile.name);
      formData.append("phone", editedProfile.phone);
      formData.append("location", editedProfile.location);
      formData.append("description", editedProfile.description);
      formData.append("showPhone", editedProfile.showPhone ? "true" : "false");

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      } else {
        formData.append(
          "existingProfileImage",
          getImageName(profile.profileImage)
        );
      }

      if (backgroundImageFile) {
        formData.append("backgroundImage", backgroundImageFile);
      } else {
        formData.append(
          "existingBackgroundImage",
          getImageName(backgroundImage)
        );
      }

      const res = await axios.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = {
        ...res.data,
        profileImage: res.data.profileImage?.startsWith("http")
          ? res.data.profileImage
          : res.data.profileImage
          ? `http://localhost:5050/uploads/${res.data.profileImage}`
          : "/assets/user.png",
        backgroundImage: res.data.backgroundImage?.startsWith("http")
          ? res.data.backgroundImage
          : res.data.backgroundImage
          ? `http://localhost:5050/uploads/${res.data.backgroundImage}`
          : "/src/assets/relax.png",
        joinDate: profile.joinDate,
      };

      setProfile(updated);
      setEditedProfile(updated);

      setBackgroundImage(updated.backgroundImage);
      setProfileImageFile(null);
      setBackgroundImageFile(null);
      setIsEditing(false);

      setEditedProfile({ ...updated });
      beabd5bf900e7aa7cf83ac3f39e8c804d43c8789
      setBackgroundImage(updated.backgroundImage);
      setProfileImageFile(null);
      setBackgroundImageFile(null);
      setIsEditing(false);
      await fetchUser();
    } catch (err) {
      alert("Failed to update profile.");
    }
    alert("Profile saved successfully!");
  };

  const fetchProfile = async () => {
    try {
      const url = id ? `/users/${id}` : "/users/profile";
      const res = await axios.get(url);
      if (!res.data) return navigate("/auth");

      const parsed = res.data;

      const profileData = {
        name: parsed.name,
        location: parsed.location || "Not set",
        email: parsed.email,
        phone: parsed.phone,
        description: parsed.description || "Helping others is my passion.",
        showPhone: parsed.showPhone !== false,
        backgroundImage: parsed.backgroundImage?.startsWith("http")
          ? parsed.backgroundImage
          : parsed.backgroundImage
          ? `http://localhost:5050/uploads/${parsed.backgroundImage}`
          : "/src/assets/relax.png",
        profileImage: parsed.profileImage?.startsWith("http")
          ? parsed.profileImage
          : parsed.profileImage
          ? `http://localhost:5050/uploads/${parsed.profileImage}`
          : "/assets/user.png",
        joinDate: parsed?.createdAt
          ? `Since ${new Date(parsed.createdAt).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
            })}`
          : "Join date not available",
        createdAt: parsed.createdAt,
      };

      setProfile(profileData);
      setEditedProfile({ ...profileData });
      setBackgroundImage(profileData.backgroundImage);

      if (isOwnProfile) {
        const [userDonationsRes, savedDonationsRes] = await Promise.all([
          axios.get("/donations/user"),
          axios.get("/saved"),
        ]);
        setUserDonations(userDonationsRes.data);
        setSavedDonations(savedDonationsRes.data);
      } else {
        const donationsRes = await axios.get(`/donations/byUser/${id}`);
        setUserDonations(donationsRes.data);
      }
    } catch (err) {
      navigate("/auth");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleSubmitReport = async () => {
    if (!reportReason) return alert("Please select a reason.");
    try {
      await axios.post(
        "/reports",
        {
          targetType: "user",
          reportedUserId: id,
          reason: reportReason,
          details: reportDetails,
        },
        { withCredentials: true }
      );
      alert("Report submitted successfully.");
      setShowReportModal(false);
    } catch (err) {
      alert("Failed to submit report.");
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ minHeight: "300px" }}>
      <div className="profile-page">
        <div className="cover-wrapper">
          <img
            src={backgroundImageFile ? URL.createObjectURL(backgroundImageFile) : backgroundImage}


            alt="Cover"
          />
          {isEditing && (
            <label className="edit-cover-overlay">
              <span>Change Cover Image</span>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setBackgroundImageFile(e.target.files[0])}
              />
            </label>
          )}
        </div>

        <div className="profile-main">
          <div className="profile-top">
            <div className="profile-info">
              <div className="image-container">
                <img
                  className="profile-img"
                  src={profileImageFile ? URL.createObjectURL(profileImageFile) : profile.profileImage}

                  alt="Profile"
                />
                {isEditing && (
                  <label className="edit-overlay">
                    <span>Change Profile Image</span>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setProfileImageFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
              <div className="user-details">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}

                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}

                  

                  />
                ) : (
                  <h2>{profile.name}</h2>
                )}
                {isEditing ? (
                  <textarea
                    value={editedProfile.description}

                    onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}


                  />
                ) : (
                  <p>{profile.description}</p>
                )}
              </div>
            </div>

            <div className="profile-actions">

              {!isOwnProfile && (
                <button
                  className="btn btn-outline-danger ms-2"
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag size={16} /> Report
                </button>
              )}

              <button onClick={handleMessageClick}>
                <MessageSquare size={16} /> Message
              </button>
              {isOwnProfile && (
                <button onClick={isEditing ? handleSave : () => setIsEditing(true)}>

              

                  <Pencil size={16} /> {isEditing ? "Save" : "Edit"}
                </button>
              )}
            </div>
          </div>

          <div className="profile-tabs">

            <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>About</button>
            <button className={activeTab === "donations" ? "active" : ""} onClick={() => setActiveTab("donations")}>Donations</button>
            {isOwnProfile && <button className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>Saved</button>}
          </div>

          <div className="tab-content">
            {activeTab === "about" && (
              <div>
                <p><MapPin /> {isEditing ? (
                  <select
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className="form-select inline-edit"
                  >
                    <option value="">Select your city</option>
                    <option value="Amman">Amman</option>
                    <option value="Zarqa">Zarqa</option>
                    <option value="Irbid">Irbid</option>
                    <option value="Aqaba">Aqaba</option>
                    <option value="Madaba">Madaba</option>
                    <option value="Balqa">Balqa</option>
                    <option value="Mafraq">Mafraq</option>
                    <option value="Jerash">Jerash</option>
                    <option value="Ajloun">Ajloun</option>
                    <option value="Karak">Karak</option>
                    <option value="Tafilah">Tafilah</option>
                    <option value="Ma'an">Ma'an</option>
                  </select>
                ) : profile.location}</p>
                <p><Phone /> {isOwnProfile ? profile.phone : profile.showPhone ? profile.phone : null}
                  {isOwnProfile && isEditing && (
                    <label style={{ marginLeft: "10px", fontSize: "14px" }}>
                      <input
                        type="checkbox"
                        checked={!!editedProfile.showPhone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, showPhone: e.target.checked })}
                        style={{ marginRight: "5px" }}
                      />
                      Show
                    </label>
                  )}
                </p>
                <p><Calendar /> {profile.joinDate}</p>
                <p><Mail /> {profile.email}</p>
              </div>
            )}

            {activeTab === "donations" && (
              <div className="row mt-4">
                {userDonations.map((donation) => (
                  <div key={donation._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="donation-card"
                      onClick={(e) => {
                        if (
                          e.target.closest(".dropdown-menu") ||
                          e.target.closest(".dropdown-toggle") ||
                          e.target.closest(".dropdown-item")
                        ) return;
                        navigate(`/donations/${donation._id}`);
                      }}
                    >
                      <img
                        src={`http://localhost:5050/uploads/${donation.images?.[0]}`}
                        alt="donation"
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title">{donation.title}</h5>
                        <p className="card-text text-muted small">
                          {donation.kind} - {donation.location}
                        </p>
                        {isOwnProfile && (
                          <button
                            className={`btn btn-sm ${donation.isValid === false ? 'btn-secondary' : 'btn-success'} w-100`}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axios.patch(`/donations/${donation._id}/status`, {
                                  isValid: !donation.isValid,
                                });
                                setUserDonations((prev) =>
                                  prev.map((d) =>
                                    d._id === donation._id ? { ...d, isValid: !d.isValid } : d
                                  )
                                );
                              } catch {
                                alert("Failed to update donation status");
                              }
                            }}
                          >
                            {donation.isValid === false ? "Not Valid" : "Valid"}
                          </button>
                        )}
                      </div>
                      {isOwnProfile && (
                        <div className="dropdown position-absolute top-0 end-0 m-2">
                          <button
                            className="btn btn-light btn-sm dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            <MoreVertical size={18} />
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/donations/edit/${donation._id}`);
                                }}
                              >
                                <Pencil size={14} className="me-2" /> Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Are you sure you want to delete this donation?")) {
                                    await axios.delete(`/donations/${donation._id}`);
                                    setUserDonations((prev) =>
                                      prev.filter((d) => d._id !== donation._id)
                                    );
                                  }
                                }}
                              >
                                <Trash2 size={14} className="me-2" /> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="row mt-4">
                {savedDonations.length ? savedDonations.map((don) => (
                  <div key={don._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="saved-donation-card"
                      onClick={() => navigate(`/donations/${don._id}`)}
                    >
                      <img
                        src={don.images?.[0] ? `http://localhost:5050/uploads/${don.images[0]}` : "/assets/placeholder.png"}
                        alt={don.title}
                        className="saved-donation-img"
                      />
                      <div className="card-body">
                        <h5 className="card-title">{don.title}</h5>
                        <p className="card-text text-muted small">
                          {don.kind} - {don.location}
                        </p>
                        <button
                          className="btn btn-sm btn-success mt-2 w-100"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await axios.delete(`/saved/${don._id}`);
                              setSavedDonations((prev) =>
                                prev.filter((d) => d._id !== don._id)
                              );
                            } catch {
                              alert("Failed to unsave donation.");
                            }
                          }}
                        >
                          Unsave
                        </button>
                      </div>
                    </div>
                  </div>
                )) : <p>No saved donations.</p>}
              </div>
            )}
          </div>

          </div>

          {showReportModal && (
            <div
              className="modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
              style={{ zIndex: 9999 }}
            >
              <div
                className="bg-white p-4 rounded shadow"
                style={{ width: "90%", maxWidth: "400px" }}
              >
                <h5 className="mb-3">Report this user</h5>
                <select
                  className="form-select mb-2"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="">Choose a reason</option>
                  <option value="Inappropriate behavior">
                    Inappropriate behavior
                  </option>
                  <option value="Spam or scam">Spam or scam</option>
                  <option value="Fake account">Fake account</option>
                  <option value="Harassment">Harassment</option>
                </select>
                <textarea
                  className="form-control mb-2"
                  placeholder="Additional details (optional)"
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleSubmitReport}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
  
  );
};

export default Profile;
