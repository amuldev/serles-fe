'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Team.module.css';
import SectionHeading from '../ui/SectionHeading';
import { logImageError, getFallbackImage } from '../../utils/imageUtils';

export default function Team() {
    // Personal Facebook/Instagram links removed (24 Nov 2026): they sent
    // visitors to private accounts. Roles need owner confirmation.
    const teamMembers = [
        {
            name: "Santhiya Thangaraj",
            role: "CEO & Head Baker",
            image: "/img/team/santhiya-cartoon.webp"
        },
        {
            name: "Thangaraj S.",
            role: "CFO & Creative Designer",
            image: "/img/team/thangaraj-cartoon.webp"
        },
        {
            name: "Amulraj S.",
            role: "COO",
            image: "/img/team/amulrajs-cartoon.webp"
        },
        {
            name: "Ramya",
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
            <li className={styles.member}>
                <span className={styles.photo}>
                    <Image
                        src={image}
                        alt={`${name}, ${role}`}
                        width={300}
                        height={400}
                        onError={handleImageError}
                        sizes="(max-width: 991px) 50vw, 25vw"
                    />
                </span>
                <span className={styles.name}>{name}</span>
                <span className={styles.role}>{role}</span>
            </li>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <SectionHeading eyebrow="The people behind the cakes" title="Meet the team" />
                <ul className={styles.grid}>
                    {teamMembers.map((member) => (
                        <TeamMember key={member.name} name={member.name} role={member.role} image={member.image} />
                    ))}
                </ul>
            </div>
        </section>
    );
}
