export default function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
              {`Protéger la Biodiversité de Madagascar`}
            </h2>
            <p className="text-lg text-amber-50 leading-relaxed text-pretty">
              {`Madagascar est l'un des pays les plus riches en biodiversité au monde, abritant des espèces endémiques uniques que l'on ne trouve nulle part ailleurs sur Terre. Nos parcs nationaux protègent ces écosystèmes irremplaçables et les communautés qui en dépendent.`}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                <p className="text-sm font-semibold text-amber-50">
                  Parcs Protégés
                </p>
                <p className="text-3xl font-bold">4+</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                <p className="text-sm font-semibold text-amber-50">
                  Partenaires de Conservation
                </p>
                <p className="text-3xl font-bold">10+</p>
              </div>
            </div>
          </div>

          {/* Right Statistics */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-sm uppercase tracking-widest font-semibold text-amber-50 mb-2">
                Notre Mission
              </h3>
              <p className="text-white leading-relaxed">
                {`Conserver la biodiversité unique de Madagascar grâce à une
                gestion efficace des zones protégées, à l'engagement durable des
                communautés et aux partenariats internationaux pour la
                résilience écosystémique à long terme.`}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-sm uppercase tracking-widest font-semibold text-amber-50 mb-2">
                {`Domaines d'Impact`}
              </h3>
              <ul className="space-y-2 text-white text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-yellow-200 rounded-full"></span>
                  Protection des Forêts Tropicales et Sèches
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-yellow-200 rounded-full"></span>
                  Conservation des Lémuriens et Espèces Endémiques
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-yellow-200 rounded-full"></span>
                  Programmes de Développement Communautaire
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
