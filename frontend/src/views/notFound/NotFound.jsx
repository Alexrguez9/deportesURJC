import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const NotFound = () => {
  return (
    <> 
      <Header />
        <div>
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>
      <Footer />
    </>
   
  );
};

export default NotFound;