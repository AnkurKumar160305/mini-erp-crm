import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.coerce.number().positive('Unit price must be positive'),
  minimumStock: z.coerce.number().int().min(0).default(10),
  warehouseLocation: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      minimumStock: 10,
    },
  });

  const { data: productData, isLoading: isFetching } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (productData) {
      reset({
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        unitPrice: productData.unitPrice,
        minimumStock: productData.minimumStock,
        warehouseLocation: productData.warehouseLocation || '',
      });
    }
  }, [productData, reset]);

  const uploadImageMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!selectedImage) return;
      const formData = new FormData();
      formData.append('image', selectedImage);
      return api.post(`/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (isEditing) {
        // Exclude sku from update as per backend schema
        const { sku, ...updateData } = data;
        const res = await api.put(`/products/${id}`, updateData);
        if (selectedImage) {
          await uploadImageMutation.mutateAsync(id as string);
        }
        return res;
      }
      
      const res = await api.post('/products', data);
      if (selectedImage && res.data?.data?.id) {
        await uploadImageMutation.mutateAsync(res.data.data.id);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success(
        isEditing ? 'Product updated successfully' : 'Product created successfully'
      );
      navigate('/products');
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to save product');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  if (isEditing && isFetching) {
    return <div className="p-8 text-center text-slate-500">Loading product details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/products')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name *"
              placeholder="e.g. Industrial Drill"
              {...register('name')}
              error={errors.name?.message as string}
            />

            <Input
              label="SKU *"
              placeholder="e.g. IND-DRL-001"
              {...register('sku')}
              error={errors.sku?.message as string}
              disabled={isEditing}
              helperText={isEditing ? "SKU cannot be changed after creation" : ""}
            />

            <Input
              label="Category *"
              placeholder="e.g. Tools"
              {...register('category')}
              error={errors.category?.message as string}
            />

            <Input
              label="Unit Price (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('unitPrice')}
              error={errors.unitPrice?.message as string}
            />

            <Input
              label="Minimum Stock Alert"
              type="number"
              {...register('minimumStock')}
              error={errors.minimumStock?.message as string}
              helperText="You will be warned when stock falls below this level"
            />

            <Input
              label="Warehouse Location"
              placeholder="e.g. Aisle 4, Shelf B"
              {...register('warehouseLocation')}
              error={errors.warehouseLocation?.message as string}
            />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {productData?.imageUrl && !selectedImage && (
                  <img src={productData.imageUrl} alt="Current" className="h-16 w-16 rounded-md object-cover border border-slate-200" />
                )}
                {selectedImage && (
                  <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-slate-200" />
                )}
                <div className="flex items-center justify-center w-full max-w-sm">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-500" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span></p>
                      <p className="text-xs text-slate-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/products')}
              disabled={isSubmitting || mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
