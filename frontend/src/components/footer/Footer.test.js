import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {

    it('renders Footer component without errors (Smoke Test)', () => {
        render(<Footer />);
    });

    describe('Enlaces de interés', () => {
        it('renders "Enlaces de Interés" heading', () => {
            render(<Footer />);
            const importantLinksTitle = screen.getByRole('heading', { name: /Enlaces de Interés/i });
            expect(importantLinksTitle).toBeInTheDocument();
        });
        
        it('URJC link in "Enlaces de Interés" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const importantLinksSection = containerObject.container.querySelector('div#enlaces_interes');
            const urjcLink = importantLinksSection.querySelector('a');
            expect(urjcLink).toBeInTheDocument();
            expect(urjcLink).toHaveAttribute('href', 'https://www.urjc.es/');
            expect(urjcLink).toHaveAttribute('target', '_blank');
        });

        it('Estudios link in "Enlaces de Interés" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const importantLinksSection = containerObject.container.querySelector('div#enlaces_interes');
            const estudiosLink = Array.from(importantLinksSection.querySelectorAll('a')).find(link => link.textContent.includes('Estudios'));
            expect(estudiosLink).toBeInTheDocument();
            expect(estudiosLink).toHaveAttribute('href', 'https://www.urjc.es/estudios');
            expect(estudiosLink).toHaveAttribute('target', '_blank');
        });

        it('Investigación link in "Enlaces de Interés" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const importantLinksSection = containerObject.container.querySelector('div#enlaces_interes');
            const estudiosLink = Array.from(importantLinksSection.querySelectorAll('a')).find(link => link.textContent.includes('Investigación'));
            expect(estudiosLink).toBeInTheDocument();
            expect(estudiosLink).toHaveAttribute('href', 'https://www.urjc.es/i-d-i');
            expect(estudiosLink).toHaveAttribute('target', '_blank');
        });

        it('Vida Universitaria link in "Enlaces de Interés" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const importantLinksSection = containerObject.container.querySelector('div#enlaces_interes');
            const universityLifeLink = Array.from(importantLinksSection.querySelectorAll('a')).find(link => link.textContent.includes('Vida Universitaria'));
            expect(universityLifeLink).toBeInTheDocument();
            expect(universityLifeLink).toHaveAttribute('href', 'https://www.urjc.es/estudiar-en-la-urjc/vida-universitaria');
            expect(universityLifeLink).toHaveAttribute('target', '_blank');
        });
    });

    describe('Location', () => {
        it('renders "Dirección" heading', () => {
            render(<Footer />);
            const addressTitle = screen.getByRole('heading', { name: /Dirección/i });
            expect(addressTitle).toBeInTheDocument();
        });

        it('Dirección link has correct href (empty in this case)', () => {
            const containerObject = render(<Footer />);
            const addressSection = containerObject.container.querySelector('div#location');
            const addressLink = addressSection.querySelector('a');
            expect(addressLink).toBeInTheDocument();
            expect(addressLink).toHaveAttribute('href', '');
            expect(addressLink).toHaveTextContent('Av. del Alcalde de Móstoles, 28933 Móstoles, Madrid');
        });
    });

    describe('Contact', () => {
        it('renders "Contacto" heading', () => {
            const containerObject = render(<Footer />);
            const contactTitle = containerObject.container.querySelector('div#contact');
            expect(contactTitle).toBeInTheDocument();
        });

        it('"alumnos@urjc.es" email link in "Contacto alumnos" has correct href', () => {
            const containerObject = render(<Footer />);
            const addressSection = containerObject.container.querySelector('div#contact');
            const alumnosEmailLinks = addressSection.querySelector('a');
            expect(alumnosEmailLinks).toBeInTheDocument();
            expect(alumnosEmailLinks).toHaveAttribute('href', 'mailto:alumnos@urjc.es');
        });

        it('"alumnos" phone link in "Contacto alumnos" has correct href', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#contact');
            const alumnosTelefonoLink = contactDiv.querySelectorAll('a')[1];
            expect(alumnosTelefonoLink).toBeInTheDocument();
            expect(alumnosTelefonoLink).toHaveAttribute('href', 'tel:+34914889393');
        });

        it('"info@urjc.es" email link in "Contacto general" has correct href', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#contact');
            const infoEmailLink = contactDiv.querySelectorAll('a')[2];
            expect(infoEmailLink).toBeInTheDocument();
            expect(infoEmailLink).toHaveAttribute('href', 'mailto:info@urjc.es');
        });

        it('"general" phone link in "Contacto general" has correct href', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#contact');
            const infoEmailLink = contactDiv.querySelectorAll('a')[3];
            expect(infoEmailLink).toBeInTheDocument();
            expect(infoEmailLink).toHaveAttribute('href', 'tel:+34916655060');
        });
    });

    describe('Social Media', () => {
        it('renders "Redes Sociales" heading', () => {
            render(<Footer />);
            const socialMediaTitle = screen.getByRole('heading', { name: /Redes Sociales/i });
            expect(socialMediaTitle).toBeInTheDocument();
        });

        it('LinkedIn link in "Redes Sociales" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#social');
            const linkedinLink = contactDiv.querySelectorAll('a')[0];
            expect(linkedinLink).toBeInTheDocument();
            expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/school/universidad-rey-juan-carlos/');
            expect(linkedinLink).toHaveAttribute('target', '_blank');
        });
    
        it('Facebook link in "Redes Sociales" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#social');
            const facebookLink = contactDiv.querySelectorAll('a')[1];
            expect(facebookLink).toBeInTheDocument();
            expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/universidadreyjuancarlos');
            expect(facebookLink).toHaveAttribute('target', '_blank');
        });
        
        it('Twitter link in "Redes Sociales" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#social');
            const twitterLink = contactDiv.querySelectorAll('a')[2];
            expect(twitterLink).toBeInTheDocument();
            expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/urjc');
            expect(twitterLink).toHaveAttribute('target', '_blank');
        });
    
        it('YouTube link in "Redes Sociales" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#social');
            const youtubeLink = contactDiv.querySelectorAll('a')[3];
            expect(youtubeLink).toBeInTheDocument();
            expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/user/universidadurjc');
            expect(youtubeLink).toHaveAttribute('target', '_blank');
        });
    
        it('Instagram link in "Redes Sociales" has correct href and target="_blank"', () => {
            const containerObject = render(<Footer />);
            const contactDiv = containerObject.container.querySelector('div#social');
            const instagramLink = contactDiv.querySelectorAll('a')[4];
            expect(instagramLink).toBeInTheDocument();
            expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/urjc_uni/?hl=es');
            expect(instagramLink).toHaveAttribute('target', '_blank');
        });

    });

    it('renders copyright and license text', () => {
        render(<Footer />);
        const copyrightText = screen.getByText(/© TFG Alejandro Rodríguez 2024/i);
        const licenseText = screen.getByText(/Released under the MIT License./i);
        expect(copyrightText).toBeInTheDocument();
        expect(licenseText).toBeInTheDocument();
    });

    it('renders legal links: Aviso Legal, Política de Privacidad, Política de Cookies', () => {
        const containerObject = render(<Footer />);
        const contactDiv = containerObject.container.querySelector('div#legal');
        const links = contactDiv.querySelectorAll('a');
        const avisoLegalLink = links[0];
        const politicaPrivacidadLink = links[1];
        const politicaCookiesLink = links[2];

        expect(avisoLegalLink).toBeInTheDocument();
        expect(politicaPrivacidadLink).toBeInTheDocument();
        expect(politicaCookiesLink).toBeInTheDocument();

        expect(avisoLegalLink).toHaveAttribute('href', '');
        expect(politicaPrivacidadLink).toHaveAttribute('href', '');
        expect(politicaCookiesLink).toHaveAttribute('href', '');
    });
});