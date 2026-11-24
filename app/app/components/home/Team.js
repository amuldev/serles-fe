'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Team.module.css';
import { logImageError, getFallbackImage } from '../../utils/imageUtils';

export default function Team() {
    // Personal Facebook/Instagram links removed (24 Nov 2026): they sent
    // visitors to private accounts. Roles need owner confirmation.
    const teamMembers = [
        {
            name: "SANTHIYA THANGARAJ",
            role: "CEO & Head Baker",
            image: "/img/team/santhiya-cartoon.webp"
        },
        {
            name: "THANGARAJ S.",
            role: "CFO & Creative Designer",
            image: "/img/team/thangaraj-cartoon.webp"
        },
        {
            name: "AMULRAJ S.",
            role: "COO",
            image: "/img/team/amulrajs-cartoon.webp"
        },
        {
            name: "RAMYA",
            role: "CFO",
            image: "/img/team/ramya-cartoon.webp"
        }
    ];

    function TeamMember({ name, role, image }) {
        const handleImageError = (e) => {
            logImageError(image, 'Team', new Error('Image failed to load'));
            e.target.src = getFallbackImage('team');
        };

        return (
            <div className="col-lg-3 col-md-6 col-6">
                <div className={`team__item set-bg ${styles.teamItem}`}>
                    <Image
                        src={image}
                        alt={name}
                        title={name}
                        width={300}
                        height={400}
                        className={styles.teamMemberImage}
                        onError={handleImageError}
                        sizes="(max-width: 991px) 50vw, 25vw"
                    />
                    <div className={`team__item__text ${styles.teamItemText}`}>
                        <h3 className="h6">{name}</h3>
                        <span>{role}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="team spad">
            <div className="container">
                <div className="row">
                    <div className="col-lg-7 col-md-7 col-sm-7">
                        <div className="section-title">
                            <span className="text-pink cursive">Team Members</span>
                            <h2 className="h1 text-gray">Meet the Team  </h2>
                        </div>
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-5">

                    </div>
                </div>
                <div className="row">
                    {teamMembers.map((member, idx) => (
                        <TeamMember
                            key={idx}
                            name={member.name}
                            role={member.role}
                            image={member.image}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
