import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DonationForm from "../components/DonationForm";
import axios from "axios";

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await axios.get(`/donations/${id}`, {
          withCredentials: true,
        });
        setDonation(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch donation:", err.message);
        navigate("/profile"); // أو إلى صفحة الخطأ
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!donation) return <p>Donation not found.</p>;

  return    <div className="main-content"> <DonationForm mode="edit" donation={donation} /></div>;
};

export default EditDonation;
