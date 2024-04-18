import React from 'react';
import './Footer.css';


const Footer = () => {
    return (
        <footer>
            <div id="content">
                <div id="contact">
                    <h2>Contacto</h2>
                    <h3>Contacto para alumnos</h3>
                    <a href="">Email: alumnos@urjc.es</a>
                    <a href="">Teléfono: (+34) 914 889 393</a>
                    <h3>Contacto general</h3>
                    <a href="">Email: info@urjc.es</a>
                    <a href="">Teléfono: (+34) 916 655 060</a>
                </div>
                <div id="social">
                    <h2>Redes Sociales</h2>
                    <a href="https://www.linkedin.com/school/universidad-rey-juan-carlos/">LinkedIn</a>
                    <a href="https://www.facebook.com/universidadreyjuancarlos">Facebook</a>
                    <a href="https://twitter.com/urjc">Twitter</a>
                    <a href="https://www.youtube.com/user/universidadurjc">YouTube</a>
                    <a href="https://www.instagram.com/urjc_uni/?hl=es">Instagram</a>
                    
                </div>
                <div id="location">
                    <h2>Dirección</h2>
                    <a href="" >Calle Falsa, 123</a>
                    <a href="">Código Postal: 12345</a>
                    <a href="" >Móstoles, Madrid</a>
                </div>
                <div id="enlaces-interes">
                    <h2>Enlaces de Interés</h2>
                    <a href="https://www.urjc.es/">URJC</a>
                    <a href="https://www.urjc.es/estudios">Estudios</a>
                    <a href="https://www.urjc.es/i-d-i">Investigación</a>
                    <a href="https://www.urjc.es/vida-universitaria">Vida Universitaria</a>
                </div>
                <div id="legal">
                    <h2>Legal</h2>
                    <a href="">Aviso Legal</a>
                    <a href="">Política de Privacidad</a>
                    <a href="">Política de Cookies</a>
                </div>
            </div>
        <p>© TFG Alejandro Rodríguez 2024</p>
        </footer>
    )
}

export default Footer;