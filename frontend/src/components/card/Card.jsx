import './Card.css';
import PropTypes from 'prop-types';

const Card = ({ className, img, description }) => {
  return (
    <div className={className ? `card ${className}` : 'card'}>
        <img src={img} alt="" className="card-img"/>
        <p>{description}</p>
    </div>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  img: PropTypes.string,
  description: PropTypes.string.isRequired,
};
export default Card;