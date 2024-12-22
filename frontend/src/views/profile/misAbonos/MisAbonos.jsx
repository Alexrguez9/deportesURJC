import React, { useState, useEffect, Fragment } from 'react';
import './MisAbonos.css';
import moment from 'moment';
import { useAuth } from '../../../context/AuthContext';
import { useInstalacionesReservas } from '../../../context/InstalacioesReservasContext';


const MisAbonos = () => {
    const { user } = useAuth();


    const opcionesReservaSalas = ['gimnasio', 'atletismo'];
    return (
        <div>
            <h1>Mis Abonos</h1>
            <div className='content-mis-reservas'>
                {user ? (
                    <Fragment>
                        <div className="card">
                            <img src={user.profilePicture || 'default-profile.png'} alt="Profile" className="profile-picture" />
                            <p>{user.name || 'Usuario'}</p>
                            <h2>GIMNASIO MENSUAL</h2>
                            {user?.alta?.gimnasio?.estado ? (
                                <Fragment>
                                    <p>Abono activo</p>
                                    <p>{ user?.alta?.gimnasio?.fechaInicio } - { user?.alta?.gimnasio?.fechaFin }</p>
                                    {/* <p>{ user?.alta?.gimnasio?.fechaInicio?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                </Fragment>
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                        </div>

                        <div className="card">
                            <img src={user.profilePicture || 'default-profile.png'} alt="Profile" className="profile-picture" />
                            <p>{user.name || 'Usuario'}</p>
                            <h2>ATLETISMO MENSUAL</h2>
                            {user?.alta?.altetismo?.estado ? (
                                <Fragment>
                                    <p>Abono activo</p>
                                    <p>{ user?.alta?.atletismo?.fechaInicio } - { user?.alta?.atletismo?.fechaFin }</p>
                                    {/* <p>{ user?.alta?.atletismo?.fechaInicio?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                </Fragment>
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                        </div>
                    </Fragment>
                ): <p>Debes iniciar sesión para acceder a tus abonos</p>}
            </div>
        </div>
    );
};

export default MisAbonos;