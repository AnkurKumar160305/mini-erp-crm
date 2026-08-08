import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../hooks/useToast';

const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export function CustomerForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerType: 'RETAIL',
      status: 'LEAD',
    },
  });

  const { data: customerData, isLoading: isFetching } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      return res.data.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (customerData) {
      reset({
        customerName: customerData.customerName,
        mobile: customerData.mobile,
        email: customerData.email || '',
        businessName: customerData.businessName || '',
        gstNumber: customerData.gstNumber || '',
        customerType: customerData.customerType,
        address: customerData.address || '',
        status: customerData.status,
        notes: customerData.notes || '',
      });
    }
  }, [customerData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (isEditing) {
        return api.put(`/customers/${id}`, data);
      }
      return api.post('/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success(
        isEditing ? 'Customer updated successfully' : 'Customer created successfully'
      );
      navigate('/customers');
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to save customer');
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    mutation.mutate(data);
  };

  if (isEditing && isFetching) {
    return <div className="p-8 text-center text-slate-500">Loading customer details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/customers')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h1>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Customer Name *"
              placeholder="e.g. Rahul Kumar"
              {...register('customerName')}
              error={errors.customerName?.message as string}
            />

            <Input
              label="Mobile Number *"
              placeholder="e.g. 9876543210"
              {...register('mobile')}
              error={errors.mobile?.message as string}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="rahul@example.com"
              {...register('email')}
              error={errors.email?.message as string}
            />

            <Input
              label="Business Name"
              placeholder="Rahul Enterprises"
              {...register('businessName')}
              error={errors.businessName?.message as string}
            />

            <Input
              label="GST Number"
              placeholder="22AAAAA0000A1Z5"
              {...register('gstNumber')}
              error={errors.gstNumber?.message as string}
            />

            <Select
              label="Customer Type *"
              {...register('customerType')}
              error={errors.customerType?.message as string}
              options={[
                { value: 'RETAIL', label: 'Retail' },
                { value: 'WHOLESALE', label: 'Wholesale' },
                { value: 'DISTRIBUTOR', label: 'Distributor' },
              ]}
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                placeholder="Full address here..."
                {...register('address')}
                error={errors.address?.message as string}
              />
            </div>

            <Select
              label="Status *"
              {...register('status')}
              error={errors.status?.message as string}
              options={[
                { value: 'LEAD', label: 'Lead' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="Any additional information..."
                {...register('notes')}
              />
              {errors.notes && <p className="mt-1 text-sm text-error-600">{errors.notes.message as string}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/customers')}
              disabled={isSubmitting || mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
