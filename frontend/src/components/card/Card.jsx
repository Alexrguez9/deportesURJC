import React from 'react';
import './Card.css';

const Card = ({ className, img, description }) => {
  return (
    <div className={className ? `card ${className}` : 'card'}>
        <img src={img} alt="" className="card-img"/>
        <p>{description}</p>
    </div>
  );
}
export default Card;