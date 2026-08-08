import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Edit, Plus, Calendar, User, Phone, Mail, Building, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

const followUpSchema = z.object({
  note: z.string().min(1, 'Note is required').max(1000),
  followUpDate: z.string().optional(),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
  });

  const followUpMutation = useMutation({
    mutationFn: async (data: FollowUpFormData) => {
      return api.post(`/customers/${id}/followups`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      success('Follow-up added successfully');
      reset();
      setShowFollowUpForm(false);
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to add follow-up');
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-error-500">Customer not found</div>;
  }

  const onSubmitFollowUp = (data: FollowUpFormData) => {
    followUpMutation.mutate(data);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/customers')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{customer.customerName}</h1>
          <Badge variant={
            customer.status === 'ACTIVE' ? 'success' :
            customer.status === 'INACTIVE' ? 'error' : 'warning'
          }>
            {customer.status}
          </Badge>
        </div>
        <Link to={`/customers/${id}/edit`}>
          <Button variant="secondary">
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
            
            <div className="flex items-start space-x-3 text-sm">
              <Phone className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{customer.mobile}</p>
                <p className="text-slate-500">Mobile</p>
              </div>
            </div>

            {customer.email && (
              <div className="flex items-start space-x-3 text-sm">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{customer.email}</p>
                  <p className="text-slate-500">Email</p>
                </div>
              </div>
            )}

            {customer.businessName && (
              <div className="flex items-start space-x-3 text-sm">
                <Building className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{customer.businessName}</p>
                  <p className="text-slate-500">Business Name</p>
                </div>
              </div>
            )}

            {customer.address && (
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{customer.address}</p>
                  <p className="text-slate-500">Address</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Business Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Customer Type</span>
                <span className="font-medium">{customer.customerType}</span>
              </div>
              
              {customer.gstNumber && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">GST Number</span>
                  <span className="font-medium">{customer.gstNumber}</span>
                </div>
              )}
              
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Created On</span>
                <span className="font-medium">{format(new Date(customer.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            {customer.notes && (
              <div className="pt-2">
                <p className="text-slate-500 text-xs mb-1">Notes</p>
                <p className="text-sm bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap">
                  {customer.notes}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-900">Follow-ups</h3>
              <Button size="sm" onClick={() => setShowFollowUpForm(!showFollowUpForm)}>
                {showFollowUpForm ? 'Cancel' : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Follow-up
                  </>
                )}
              </Button>
            </div>

            {showFollowUpForm && (
              <form onSubmit={handleSubmit(onSubmitFollowUp)} className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Note *</label>
                    <textarea
                      className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Discussed requirements..."
                      {...register('note')}
                    />
                    {errors.note && <p className="mt-1 text-sm text-error-600">{errors.note.message}</p>}
                  </div>
                  
                  <Input
                    label="Next Follow-up Date (Optional)"
                    type="datetime-local"
                    {...register('followUpDate')}
                    error={errors.followUpDate?.message as string}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || followUpMutation.isPending}>
                      Save Follow-up
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {customer.followUps && customer.followUps.length > 0 ? (
                customer.followUps.map((followUp: any) => (
                  <div key={followUp.id} className="border-l-2 border-primary-500 pl-4 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center text-xs text-slate-500 space-x-2">
                        <User className="h-3 w-3" />
                        <span>{followUp.user?.name || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{format(new Date(followUp.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 mb-2">{followUp.note}</p>
                    
                    {followUp.followUpDate && (
                      <div className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        <Calendar className="mr-1 h-3 w-3" />
                        Next: {format(new Date(followUp.followUpDate), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No follow-ups recorded yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
