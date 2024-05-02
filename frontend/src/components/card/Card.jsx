import React from 'react';
import './Card.css';

const Card = ({ img, description }) => {
  return (
    <div className="card">
        <img src={img} alt="" className="card-img"/>
        <p>{description}</p>
    </div>
  );
}
export default Card;