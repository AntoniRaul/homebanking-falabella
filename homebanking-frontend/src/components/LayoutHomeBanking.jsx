import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function LayoutHomeBanking() {
    return (
        <div className="hb-app">
            <Navbar />
            <main className="hb-main">
                <Outlet />
            </main>
        </div>
    );
}
