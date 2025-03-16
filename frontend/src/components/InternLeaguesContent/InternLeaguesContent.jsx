import { Link } from "react-router-dom";
import "./InternLeaguesContent.css";
import { MdEmojiEvents } from "react-icons/md";
import { PiRankingLight } from "react-icons/pi";

const MainLigasInternas = () => {
    return (
        <>
            <h1>Ligas Internas</h1>
            <p>Bienvenido a la página de Ligas Internas de URJC Deportes. Aquí podrás consultar los encuentros y clasificaciones de las Ligas Internas.</p>
            <section>
                <div className='ligas-internas'>
                    <Link to="/ligas-internas/encuentros">
                        <div className='horizontal-card'>
                            <MdEmojiEvents style={{ padding: '1rem' }}/>
                            <p>Encuentros</p>
                        </div>
                    </Link>
                    <Link to="/ligas-internas/clasificaciones">
                        <div className='horizontal-card'>
                            <PiRankingLight style={{ padding: '1rem' }}/>
                            <p>Clasificaciones</p>
                        </div>
                    </Link>
                </div>
            </section>
        </>
    );
}

export default MainLigasInternas;
