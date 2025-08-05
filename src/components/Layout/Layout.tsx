import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Helmet>
        <title>La Virtual Zone</title>
        <meta name="description" content="La comunidad definitiva de fútbol virtual" />
        <meta property="og:title" content="La Virtual Zone" />
        <meta property="og:description" content="La comunidad definitiva de fútbol virtual" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/master-league-pes.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="La Virtual Zone" />
        <meta name="twitter:description" content="La comunidad definitiva de fútbol virtual" />
      </Helmet>
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
 