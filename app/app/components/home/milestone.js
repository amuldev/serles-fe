import { FaMapMarkerAlt, FaTruck, FaComments, FaWallet } from "react-icons/fa";

// Static JSON data for milestones
const milestonesData = [
  {
    icon: <FaMapMarkerAlt size={32} color="#fff" />,
    label: "OUR BAKERY",
    value: "Ilanji",
  },
  {
    icon: <FaTruck size={32} color="#fff" />,
    label: "DELIVERY: BY ROAD, ADDRESS CHECK REQUIRED",
    value: "Up to 20 km",
  },
  {
    icon: <FaComments size={32} color="#fff" />,
    label: "CONFIRM YOUR ORDER",
    value: "WhatsApp",
  },
  {
    icon: <FaWallet size={32} color="#fff" />,
    label: "GOOGLE PAY & ONLINE PAYMENTS",
    value: "Pay online",
  },
];

// Reusable MilestoneItem component
function MilestoneItem({ icon, label, value }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center px-2 px-md-4">
      <div
        style={{
          background: "#ff91a4",
          padding: "12px",
          borderRadius: "6px",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.85rem",
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "4px",
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: "2rem",
          textAlign: "center",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// MilestoneBar component
export default function MilestoneBar({ data = milestonesData }) {
  return (
    <section
      style={{
        background: "#231f20",
        padding: "36px 0 24px 0",
        borderBottom: "4px solid #fff",
      }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center">
          {data.map((item, idx) => (
            <div
              className="col-6 col-md-3 mb-4 mb-md-0 d-flex justify-content-center"
              key={idx}
            >
              <MilestoneItem {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
