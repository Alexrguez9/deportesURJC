import React from 'react';
import './Card.css';

const Card = ({ className, img, description }) => {
  return (
    <div className={`card ${className}`}>
        <img src={img} alt="" className="card-img"/>
        <p>{description}</p>
    </div>
  );
}
export default Card;