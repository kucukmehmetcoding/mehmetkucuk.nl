import { Link } from '@/i18n/routing';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <FileQuestion className="h-16 w-16 text-blue-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Sayfa Bulunamadı</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <Home className="w-5 h-5 mr-2" />
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
