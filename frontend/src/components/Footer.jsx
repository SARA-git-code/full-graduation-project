import { HashLink as Link } from 'react-router-hash-link';
import { HeartHandshake } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import herovideo from '../assets/herovideo.mp4'; 
import '../styles/footer.css'

const Footer = () => {
  return (
    <footer className="foot shadow-sm start-0 end-0 position-relative">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="position-absolute end-0 start-0 w-100 h-100"
        style={{ objectFit: 'cover' }}
      >
        <source src={herovideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for contrast */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          background: 'rgba(0, 0, 0, 0.48)',
        }}
      ></div>

      {/* Main Footer Content */}
      <div className="container py-5 px-3 position-relative text-light animate-slide-bottom">
        <div className="d-flex flex-wrap justify-content-center gap-4 mb-4 text-center text-md-start">

          {/* About Us */}
          <Link to="/#about" className="text-decoration-none" style={{ color: '#ffffff' }}>
            About Us
          </Link>


          {/* Profile */}
          <Link to="/profile" className="text-decoration-none" style={{ color: '#ffffff' }}>
            Profile
          </Link>

          {/* Donations */}
          <Link to="/donations" className="text-decoration-none" style={{ color: '#ffffff' }}>
            Donations
          </Link>

          {/* Social Icons */}
          <div className="d-flex justify-content-center justify-content-md-start gap-3 social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white">
              <FaInstagram size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">
              <FaFacebook size={20} />
            </a>
          </div>
        </div>

        {/* Bottom Branding - Centered and Final */}
        <div className="d-flex flex-column align-items-center justify-content-center text-center">
          <div className="d-flex align-items-center gap-2 mb-1">
            <HeartHandshake className="text-primary" size={25} />
            <span className="text-dark fw-semibold">Together we give, together we grow</span>
            <span className="text-info">|</span>
            <span className="text-dark fw-semibold">Give & Gather © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
