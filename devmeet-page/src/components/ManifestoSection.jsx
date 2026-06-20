import React from 'react';
import { OutlinedButton } from './Buttons';
import './ManifestoSection.css';

export const ManifestoSection = () => {
  return (
    <section className="manifesto-section">
      <h2 className="manifesto-title">Why Hyperstudio?</h2>
      <div className="manifesto-content">
        <p>
          We believe that digital experiences should feel like physical spaces. They should have atmosphere, structure, and intent. In an era of templated solutions and noisy interfaces, we build digital environments that trust restraint.
        </p>
        <p>
          Every pixel is an editorial choice. Every interaction is an architectural decision. We design for founders and creators who understand that the quietest voice in the room is often the most confident.
        </p>
      </div>
      <div className="manifesto-action">
        <OutlinedButton onClick={() => console.log('Read Manifesto')}>
          READ MANIFESTO
        </OutlinedButton>
      </div>
    </section>
  );
};
