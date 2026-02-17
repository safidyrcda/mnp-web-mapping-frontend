import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-b from-white to-amber-50 border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-3xl">
                <Image src="/logo.jpg" alt="Logo" width={50} height={100} />
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-amber-900">
                Madagascar National Parks
              </h1>
              <p className="text-lg md:text-xl font-semibold text-amber-700"></p>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center md:text-right">
            {/* <p className="text-sm uppercase tracking-widest text-amber-700 font-semibold mb-2">
              Plateforme de Conservation
            </p> */}
            <p className="text-lg text-gray-700 font-light">
              Explorer les Aires Protégées et les Partenaires de Financement
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
