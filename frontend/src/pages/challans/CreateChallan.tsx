import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Save, FileText } from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(challanItemSchema).min(1, 'At least one item is required'),
});

type CreateChallanFormData = z.infer<typeof createChallanSchema>;

export function CreateChallan() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['all-customers'],
    queryFn: async () => {
      const res = await api.get('/customers', { params: { limit: 1000 } });
      return res.data.data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 1000 } });
      return res.data.data;
    }
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateChallanFormData>({
    resolver: zodResolver(createChallanSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  const calculateTotal = () => {
    if (!products) return 0;
    return watchedItems.reduce((total, item) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (product && item.quantity) {
        return total + (product.unitPrice * item.quantity);
      }
      return total;
    }, 0);
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateChallanFormData) => {
      return api.post('/challans', data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      success('Sales challan created successfully');
      navigate(`/challans/${res.data.data.id}`);
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to create challan');
    }
  });

  const onSubmit = (data: CreateChallanFormData) => {
    mutation.mutate(data);
  };

  const customerOptions = customers?.map((c: any) => ({
    value: c.id,
    label: `${c.customerName} ${c.businessName ? `(${c.businessName})` : ''}`
  })) || [];

  const productOptions = products?.map((p: any) => ({
    value: p.id,
    label: `${p.name} - ₹${p.unitPrice} (Stock: ${p.currentStock})`
  })) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/challans')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-slate-700" />
            Create Sales Challan
          </h1>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="max-w-md">
            <Select
              label="Select Customer *"
              options={[{ value: '', label: 'Select a customer...' }, ...customerOptions]}
              {...register('customerId')}
              error={errors.customerId?.message as string}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">Challan Items</h3>
              <Button type="button" variant="secondary" size="sm" onClick={() => append({ productId: '', quantity: 1 })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => {
              const selectedProductId = watchedItems[index]?.productId;
              const selectedProduct = products?.find((p: any) => p.id === selectedProductId);
              const unitPrice = selectedProduct?.unitPrice || 0;
              const quantity = watchedItems[index]?.quantity || 0;
              const totalPrice = unitPrice * quantity;

              return (
                <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 w-full">
                    <Select
                      label={`Product ${index + 1} *`}
                      options={[{ value: '', label: 'Select a product...' }, ...productOptions]}
                      {...register(`items.${index}.productId` as const)}
                      error={errors.items?.[index]?.productId?.message as string}
                    />
                  </div>
                  
                  <div className="w-full sm:w-32">
                    <Input
                      label="Quantity *"
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity` as const)}
                      error={errors.items?.[index]?.quantity?.message as string}
                    />
                  </div>
                  
                  <div className="w-full sm:w-32 pb-2">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total</div>
                    <div className="font-semibold text-slate-900">₹{totalPrice.toFixed(2)}</div>
                  </div>

                  <div className="pb-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {errors.items?.root && <p className="text-sm text-error-600">{errors.items.root.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200">
            <div className="text-xl mb-4 sm:mb-0">
              <span className="text-slate-500 mr-2">Grand Total:</span>
              <span className="font-bold text-slate-900">₹{calculateTotal().toFixed(2)}</span>
            </div>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/challans')}
                disabled={isSubmitting || mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting || mutation.isPending ? 'Creating...' : 'Create Challan'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
