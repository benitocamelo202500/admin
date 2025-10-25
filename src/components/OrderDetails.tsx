import { useState, useEffect } from 'react';
import { AdminUser, Order, validateDocuments, validateStock, getRequiredDocuments } from '../lib/supabase';

interface OrderDetailsProps {
  order: Order;
  user: AdminUser;
  onClose: () => void;
}

type TabType = 'info' | 'documents' | 'stock';

export default function OrderDetails({ order, user, onClose }: OrderDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);

  useEffect(() => {
    if (order.order_items) {
      getRequiredDocuments(order.order_items).then(setRequiredDocs);
    }
  }, [order]);

  const handleValidateDocuments = async (status: 'approved' | 'rejected') => {
    if (loading) return;

    const confirmMessage = status === 'approved'
      ? '¿Confirma que desea APROBAR la validación de documentos?'
      : '¿Confirma que desea RECHAZAR la validación de documentos?';

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    const success = await validateDocuments(order.id, user.id, status, notes || undefined);
    setLoading(false);

    if (success) {
      alert(`Documentos ${status === 'approved' ? 'aprobados' : 'rechazados'} correctamente`);
      onClose();
    } else {
      alert('Error al validar documentos. Intente nuevamente.');
    }
  };

  const handleValidateStock = async (status: 'approved' | 'rejected') => {
    if (loading) return;

    const confirmMessage = status === 'approved'
      ? '¿Confirma que desea APROBAR la verificación de stock?'
      : '¿Confirma que desea RECHAZAR la verificación de stock?';

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    const success = await validateStock(order.id, user.id, status, notes || undefined);
    setLoading(false);

    if (success) {
      alert(`Stock ${status === 'approved' ? 'aprobado' : 'rechazado'} correctamente`);
      onClose();
    } else {
      alert('Error al validar stock. Intente nuevamente.');
    }
  };

  const uploadedDocs = order.order_documents?.map(doc => doc.document_type) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Orden {order.order_number}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-slate-700 text-slate-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Información General
            </button>
            {user.role === 'administrator' && (
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-slate-700 text-slate-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documentos
              </button>
            )}
            {user.role === 'logistic' && (
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'stock'
                    ? 'border-slate-700 text-slate-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Verificación de Stock
              </button>
            )}
          </nav>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          {activeTab === 'info' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-medium">{order.customer?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">DNI</p>
                    <p className="font-medium">{order.customer?.dni}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{order.customer?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{order.customer?.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Armas Solicitadas</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.weapon?.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.weapon?.brand} - {item.weapon?.model}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Categoría: {item.weapon?.category} | Calibre: {item.weapon?.caliber}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        <p className="font-medium text-gray-900">S/ {item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-900">Total</p>
                    <p className="text-2xl font-bold text-slate-700">S/ {order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Validaciones</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${order.documents_validated ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      {order.documents_validated ? (
                        <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Documentos</p>
                        <p className="text-sm text-gray-600">
                          {order.documents_validated ? 'Validado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${order.stock_validated ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      {order.stock_validated ? (
                        <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Stock</p>
                        <p className="text-sm text-gray-600">
                          {order.stock_validated ? 'Validado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && user.role === 'administrator' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos Requeridos</h3>
                <div className="space-y-2">
                  {requiredDocs.map((docType) => {
                    const isUploaded = uploadedDocs.includes(docType);
                    const doc = order.order_documents?.find(d => d.document_type === docType);

                    return (
                      <div
                        key={docType}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          isUploaded ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center">
                          {isUploaded ? (
                            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{docType}</p>
                            <p className="text-sm text-gray-600">
                              {isUploaded ? 'Documento cargado' : 'Documento faltante'}
                            </p>
                          </div>
                        </div>
                        {isUploaded && doc && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:text-slate-900 text-sm font-medium"
                          >
                            Ver documento →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {!order.documents_validated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Agregue notas sobre la validación..."
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleValidateDocuments('approved')}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : 'Aprobar Documentos'}
                    </button>
                    <button
                      onClick={() => handleValidateDocuments('rejected')}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : 'Rechazar Documentos'}
                    </button>
                  </div>
                </div>
              )}

              {order.documents_validated && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Los documentos ya han sido validados para esta orden.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stock' && user.role === 'logistic' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificación de Stock</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) => {
                    const hasStock = (item.weapon?.stock || 0) >= item.quantity;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          hasStock ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {hasStock ? (
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                              <p className="font-medium text-gray-900">{item.weapon?.name}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.weapon?.brand} - {item.weapon?.model}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-600">Solicitado: {item.quantity}</p>
                            <p className={`font-medium ${hasStock ? 'text-green-700' : 'text-red-700'}`}>
                              Disponible: {item.weapon?.stock || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!order.stock_validated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Agregue notas sobre la verificación de stock..."
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleValidateStock('approved')}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : 'Aprobar Stock'}
                    </button>
                    <button
                      onClick={() => handleValidateStock('rejected')}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : 'Rechazar Stock'}
                    </button>
                  </div>
                </div>
              )}

              {order.stock_validated && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    El stock ya ha sido validado para esta orden.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
