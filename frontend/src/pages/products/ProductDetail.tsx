import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Package, Hash, Tag, MapPin, IndianRupee, History } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-error-500">Product not found</div>;
  }

  const isLowStock = product.currentStock <= product.minimumStock;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/products')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isLowStock ? 'bg-error-100 text-error-800' : 'bg-success-100 text-success-800'}`}>
            {product.currentStock} in stock
          </div>
        </div>
        <Link to={`/products/${id}/edit`}>
          <Button variant="secondary">
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden mb-6 border border-slate-200">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Package className="h-12 w-12 mb-2" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Hash className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{product.sku}</p>
                  <p className="text-slate-500">SKU</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Tag className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{product.category}</p>
                  <p className="text-slate-500">Category</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <IndianRupee className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">₹{product.unitPrice.toFixed(2)}</p>
                  <p className="text-slate-500">Unit Price</p>
                </div>
              </div>

              {product.warehouseLocation && (
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">{product.warehouseLocation}</p>
                    <p className="text-slate-500">Location</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <History className="mr-2 h-5 w-5 text-slate-400" />
                Recent Stock Movements
              </h3>
            </div>

            <div className="space-y-4">
              {product.stockMovements && product.stockMovements.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4">
                  {product.stockMovements.map((movement: any) => (
                    <div key={movement.id} className="relative pl-6">
                      <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${movement.movementType === 'IN' ? 'bg-success-500' : 'bg-error-500'}`} />
                      
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-medium text-slate-900">
                            {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity} units
                          </span>
                          <span className="ml-2 text-sm text-slate-500">
                            by {movement.user?.name || 'Unknown User'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {format(new Date(movement.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      {movement.reason && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                          {movement.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No stock movements recorded yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
