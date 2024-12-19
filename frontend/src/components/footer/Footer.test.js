import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { within } from '@testing-library/react';

// Grupo de pruebas para el componente Footer
describe('Footer Component', () => {
    
    test('renders "Enlaces de Interés" section with correct links', () => {
        render(<Footer />);
        expect(screen.getByText(/Enlaces de Interés/i)).toBeInTheDocument();
    
        const urjcLink = screen.queryAllByText(/URJC/i).find(link => link.closest('a'));
        expect(urjcLink.closest('a')).toHaveAttribute('href', 'https://www.urjc.es/');
        expect(screen.getByText(/Estudios/i, { exact: false })).toHaveAttribute('href', 'https://www.urjc.es/estudios');
        expect(screen.getByText(/Investigación/i, { exact: false })).toHaveAttribute('href', 'https://www.urjc.es/i-d-i');
        expect(screen.getByText(/Vida Universitaria/i, { exact: false })).toHaveAttribute(
            'href',
            'https://www.urjc.es/estudiar-en-la-urjc/vida-universitaria'
        );
    });
    

    test('renders "Dirección" section with correct address and postal code', () => {
        render(<Footer />);
        expect(screen.getByText(/Dirección/i)).toBeInTheDocument();

        const direccionLink = screen.getByText(/Av. del Alcalde de Móstoles/i).closest('a');
        expect(direccionLink).toBeInTheDocument();
        expect(direccionLink).toHaveAttribute('href', '');
    
        expect(screen.getByText(/Código Postal: 12345/i)).toBeInTheDocument();
    });
    
    test('renders "Contacto" section with correct email and phone links', () => {
        render(<Footer />);
        const allContactTexts = screen.getAllByText(/Contacto/i);
        const contactoSection = allContactTexts[0].closest('div');
        expect(contactoSection).toBeInTheDocument();
    
        const { getByRole } = within(contactoSection);
        expect(getByRole('link', { name: /Email: alumnos@urjc.es/i })).toHaveAttribute('href', 'mailto:alumnos@urjc.es');
        expect(getByRole('link', { name: /Teléfono: \(\+34\) 914 889 393/i })).toHaveAttribute('href', 'tel:+34914889393');
        expect(getByRole('link', { name: /Email: info@urjc.es/i })).toHaveAttribute('href', 'mailto:info@urjc.es');
        expect(getByRole('link', { name: /Teléfono: \(\+34\) 916 655 060/i })).toHaveAttribute('href', 'tel:+34916655060');
    });
    
    
    

    test('renders "Redes Sociales" section with correct links', () => {
        render(<Footer />);
        expect(screen.getByText(/Redes Sociales/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', 'https://www.linkedin.com/school/universidad-rey-juan-carlos/');
        expect(screen.getByRole('link', { name: /Facebook/i })).toHaveAttribute('href', 'https://www.facebook.com/universidadreyjuancarlos');
        expect(screen.getByRole('link', { name: /Twitter/i })).toHaveAttribute('href', 'https://twitter.com/urjc');
        expect(screen.getByRole('link', { name: /YouTube/i })).toHaveAttribute('href', 'https://www.youtube.com/user/universidadurjc');
        expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/urjc_uni/?hl=es');
    });

    test('renders legal links with correct texts', () => {
        render(<Footer />);
        const legalLink = screen.queryAllByText(/Aviso Legal/i).find(link => link.closest('a'));
        const privacyLink = screen.queryAllByText(/Política de Privacidad/i).find(link => link.closest('a'));
        const cookiesLink = screen.queryAllByText(/Política de Cookies/i).find(link => link.closest('a'));

        expect(legalLink.closest('a')).toBeInTheDocument();
        expect(privacyLink.closest('a')).toBeInTheDocument();
        expect(cookiesLink.closest('a')).toBeInTheDocument();
    });

    test('renders copyright and license information', () => {
        render(<Footer />);
        expect(screen.getByText(/Released under the MIT License./i)).toBeInTheDocument();
        expect(screen.getByText(/© TFG Alejandro Rodríguez 2024/i)).toBeInTheDocument();
    });
});
