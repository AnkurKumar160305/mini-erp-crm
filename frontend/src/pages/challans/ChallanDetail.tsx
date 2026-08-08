import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, CheckCircle, XCircle, FileText, User, Calendar, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../store/authStore';

export function ChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: challan, isLoading } = useQuery({
    queryKey: ['challan', id],
    queryFn: async () => {
      const res = await api.get(`/challans/${id}`);
      return res.data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/challans/${id}/confirm`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      success('Challan confirmed successfully');
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to confirm challan');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/challans/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      success('Challan cancelled successfully');
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Failed to cancel challan');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading challan details...</div>;
  }

  if (!challan) {
    return <div className="p-8 text-center text-error-500">Challan not found</div>;
  }

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Challan-${challan.challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      error('Failed to download PDF');
    }
  };

  const isAdminOrSales = user?.role === 'ADMIN' || user?.role === 'SALES';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/challans')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-slate-700" />
            {challan.challanNumber}
          </h1>
          <Badge variant={
            challan.status === 'CONFIRMED' ? 'success' :
            challan.status === 'CANCELLED' ? 'error' : 'warning'
          }>
            {challan.status}
          </Badge>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          {challan.status === 'DRAFT' && isAdminOrSales && (
            <Button 
              className="bg-success-600 hover:bg-success-700"
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Challan
            </Button>
          )}
          
          {challan.status !== 'CANCELLED' && isAdmin && (
            <Button 
              variant="secondary" 
              className="text-error-600 border-error-200 hover:bg-error-50"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this challan? This cannot be undone.')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Challan Info</h3>
            
            <div className="flex items-start space-x-3 text-sm">
              <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{format(new Date(challan.createdAt), 'MMM d, yyyy')}</p>
                <p className="text-slate-500">Created Date</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <User className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{challan.user?.name || 'Unknown'}</p>
                <p className="text-slate-500">Created By</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Customer Details</h3>
            {challan.customer ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-slate-900">{challan.customer.customerName}</p>
                  {challan.customer.businessName && <p className="text-sm text-slate-600">{challan.customer.businessName}</p>}
                </div>
                
                <div className="text-sm text-slate-600">
                  <p>{challan.customer.mobile}</p>
                  {challan.customer.email && <p>{challan.customer.email}</p>}
                </div>
                
                {challan.customer.address && (
                  <div className="pt-2 border-t border-slate-100 text-sm text-slate-600">
                    <p className="font-medium text-slate-700 mb-1">Billing Address:</p>
                    <p>{challan.customer.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Customer details unavailable</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Order Items</h3>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item / SKU</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challan.items && challan.items.length > 0 ? (
                  challan.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{item.productNameSnapshot}</span>
                          <span className="text-xs text-slate-500">{item.skuSnapshot}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">₹{item.unitPriceSnapshot.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        ₹{item.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">No items found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col items-end space-y-2">
              <div className="flex justify-between w-64 text-sm text-slate-600">
                <span>Total Items:</span>
                <span>{challan.totalQuantity}</span>
              </div>
              <div className="flex justify-between w-64 text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>₹{challan.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
