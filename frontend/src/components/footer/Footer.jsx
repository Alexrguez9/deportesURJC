import './Footer.css';

const Footer = () => {
    return (
        <footer>
            <div id="footer-content">
                <div id="enlaces_interes">
                    <h5 style={{ textDecoration: 'underline' }}>Enlaces de Interés</h5>
                    <a href="https://www.urjc.es/" target="_blank">URJC</a>
                    <a href="https://www.urjc.es/estudios" target="_blank">Estudios</a>
                    <a href="https://www.urjc.es/i-d-i" target="_blank">Investigación</a>
                    <a href="https://www.urjc.es/estudiar-en-la-urjc/vida-universitaria" target="_blank">Vida Universitaria</a>
                </div>
                <div id="location">
                    <h5 style={{ textDecoration: 'underline' }}>Dirección</h5>
                    <a href="" >Av. del Alcalde de Móstoles,<br></br> 28933 Móstoles, Madrid</a>
                    <p>Código Postal: 12345</p>
                </div>
                <div id="contact">
                    <h5 style={{ textDecoration: 'underline' }}>Contacto</h5>
                    <p style={{ marginTop: 0, marginBottom: 0}}>(Para alumnos)</p>
                    <a href="mailto:alumnos@urjc.es">Email: alumnos@urjc.es</a>
                    <a href="tel:+34914889393">Teléfono: (+34) 914 889 393</a>
                    <p style={{ marginBottom: 0}}>(Contacto general)</p>
                    <a href="mailto:info@urjc.es">Email: info@urjc.es</a>
                    <a href="tel:+34916655060">Teléfono: (+34) 916 655 060</a>
                </div>
                <div id="social">
                    <h5 style={{ textDecoration: 'underline' }}>Redes Sociales</h5>
                    <a href="https://www.linkedin.com/school/universidad-rey-juan-carlos/" target="_blank">LinkedIn</a>
                    <a href="https://www.facebook.com/universidadreyjuancarlos" target="_blank">Facebook</a>
                    <a href="https://twitter.com/urjc" target="_blank">Twitter</a>
                    <a href="https://www.youtube.com/user/universidadurjc" target="_blank">YouTube</a>
                    <a href="https://www.instagram.com/urjc_uni/?hl=es" target="_blank">Instagram</a>
                </div>
            </div>
            <div id="legal">
                <a href="">Aviso Legal</a>
                <a href="">Política de Privacidad</a>
                <a href="">Política de Cookies</a>
            </div>
            <div id="license_copyright">
                <p>Released under the MIT License.</p>
                <p>© TFG Alejandro Rodríguez 2024</p>
            </div>
        </footer>
    )
}

export default Footer;