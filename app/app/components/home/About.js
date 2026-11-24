import Image from "next/image";
import Link from 'next/link';
import { FaAward, FaBakery, FaHeart } from "react-icons/fa";

export default function About() {
    return (
        <section className="about spad" style={{ background: "#fff", padding: "50px 0" }}>
            <div className="container">
                <div className="row align-items-center">
                    {/* Left: Cake Image */}
                    <div className="col-lg-6 col-md-12 mb-4 mb-lg-0 d-flex justify-content-center ">
                        <div style={{ maxWidth: 500, width: "100%" ,objectFit: "cover"}}>
                            <Image
                                src="/img/home/cakeinhand.jpg"
                                alt="Homemade Cake"
                                title="Homemade Cake"
                                width={400}
                                height={300}
                                style={{ borderRadius: "12px", objectFit: "cover", width: "100%", height: "auto" }}
                                className="img-fluid"
                            />
                        </div>
                    </div>
                    {/* Right: About Content */}
                    <div className="col-lg-6 col-md-12">
                        <div className="about__text" style={{ paddingLeft: "20px" }}>
                            <div className="section-title" style={{ marginBottom: "20px" }}>
                                <span style={{ color: "#e4718a", fontWeight: 700, fontSize: "2rem" }} className="cursive">About Us</span>
                                <h2 style={{ fontWeight: 800, fontSize: "2.2rem", margin: "10px 0 0 0", letterSpacing: "1px" }} className="h1 text-gray">
                                    WELCOME TO SERLE'S BAKE
                                </h2>
                            </div>
                            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 10 }}>
                                Serle&apos;s Bake is a homemade cake bakery on Tenkasi–Shencottai Main Road in Ilanji, Tenkasi.
                            </p>
                            <p style={{ color: "#555", fontSize: "1rem", marginBottom: 30 }}>
                                Browse our birthday cakes, photo and custom designs, tiered cakes and brownies. Every cake is baked fresh after you order, never in advance, so please order at least 4 hours before you need it. Share your occasion, preferred size and date on WhatsApp so we can check availability, design details and the final amount. Delivery is checked by road distance from our Ilanji bakery, within 20 km: see <Link href="/cake-delivery">online cake order and home delivery in Tenkasi</Link>. <Link href="/contact">Find our location and contact details</Link>.
                            </p>
                            <div className="row">
                                <div className="col-lg-6 col-12 mb-3">
                                    <div style={{ display: "flex", alignItems: "start", gap: "12px" ,flexDirection: "column" }}>
                                        <div style={{
                                            background: "#ff91a4 ",
                                          padding: "10px"
                                        }}>
                                            <FaHeart size={34} color="#fff"/>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>HOMEMADE CAKES</div>
                                            <div style={{ fontSize: ".97rem", color: "#555" }}>
                                                Browse the current cakes and brownies, then confirm your preferred weight, date and design with us.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-12 mb-3">
                                    <div style={{ display: "flex", alignItems: "start", gap: "12px" ,flexDirection: "column" }}>
                                        <div style={{
                                            background: "#ff91a4 ",
                                            padding: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                           <FaAward size={34}  color="#fff"/>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>PLAN YOUR DESIGN</div>
                                            <div style={{ fontSize: ".97rem", color: "#555" }}>
                                                Share a cake message or design reference so we can check the details and final price before confirming.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
