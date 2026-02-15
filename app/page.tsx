import Header from '../components/header';
import HeroSection from '../components/hero-section';
import OpenLayersMap from '../components/op-layers';

export default function Page() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      {/* <HeroSection /> */}

      {/* Map Section */}
      {/* Map Section */}
      <section className="w-full py-8 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:gap-8">
            {/* Hero (texte) */}
            <div className="md:w-1/3 mb-3 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Explorez les Aires Protégées
              </h2>
              <p className="text-gray-600 text-lg">
                {`Cliquez sur n'importe quelle zone protégée sur la carte pour voir
          les détails et les informations de financement`}
              </p>
            </div>

            {/* Map */}
            <div className="md:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
              <OpenLayersMap />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="w-full bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Parcs Nationaux de Madagascar
              </h3>
              <p className="text-gray-400">
                Protéger la biodiversité unique de Madagascar par la
                conservation, la recherche et le développement durable.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Nos Parcs</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Parc National Andohahela</li>
                <li>Parc National Isalo</li>
                <li>Parc National Masoala</li>
                <li>Parc National Ranomafana</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Priorités de Conservation
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>Protection des Lémuriens</li>
                <li>Restauration des Écosystèmes</li>
                <li>Engagement Communautaire</li>
                <li>Recherche en Biodiversité</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>
              &copy; 2024 Parcs Nationaux de Madagascar. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer> */}
    </main>
  );
}
