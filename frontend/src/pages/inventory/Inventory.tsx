import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, X } from 'lucide-react';
import api from '../../api/axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../hooks/useToast';

const movementSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

export function Inventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, search],
    queryFn: async () => {
      const res = await api.get('/inventory', { params: { page, limit: 10, search } });
      return res.data;
    }
  });

  // For the product dropdown in modal
  const { data: allProducts } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 1000 } });
      return res.data.data;
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      movementType: 'IN',
      quantity: 1,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: MovementFormData) => {
      return api.post('/inventory/movements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Stock movement recorded successfully');
      reset();
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to record stock movement');
    }
  });

  const onSubmit = (data: MovementFormData) => {
    mutation.mutate(data);
  };

  const productOptions = allProducts?.map((p: any) => ({
    value: p.id,
    label: `${p.name} (${p.sku}) - Stock: ${p.currentStock}`
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Stock Movement
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search inventory..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">No inventory found</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.warehouseLocation || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${item.currentStock <= item.minimumStock ? 'text-error-600' : 'text-slate-900'}`}>
                      {item.currentStock}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {data?.pagination && (
          <div className="px-4 border-t border-slate-200">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Stock Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Record Stock Movement</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 overflow-y-auto">
              <Select
                label="Product *"
                options={[{ value: '', label: 'Select a product...' }, ...productOptions]}
                {...register('productId')}
                error={errors.productId?.message as string}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Movement Type *"
                  options={[
                    { value: 'IN', label: 'Stock IN (+)' },
                    { value: 'OUT', label: 'Stock OUT (-)' }
                  ]}
                  {...register('movementType')}
                  error={errors.movementType?.message as string}
                />
                
                <Input
                  label="Quantity *"
                  type="number"
                  {...register('quantity')}
                  error={errors.quantity?.message as string}
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="e.g. New stock arrived"
                  {...register('reason')}
                />
                {errors.reason && <p className="mt-1 text-sm text-error-600">{errors.reason.message}</p>}
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting || mutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending ? 'Saving...' : 'Record Movement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
