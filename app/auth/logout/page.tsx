import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-500" />
        <p className="text-gray-600">Deconnexion...</p>
      </div>
    </div>
  );
}
