import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';

export function ChallansList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['challans', page, search],
    queryFn: async () => {
      const res = await api.get('/challans', { params: { page, limit: 10, search } });
      return res.data;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Sales Challans</h1>
        <Link to="/challans/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Challan
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search challans..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Challan No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No challans found</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((challan: any) => (
                <TableRow key={challan.id}>
                  <TableCell className="font-medium text-slate-900">{challan.challanNumber}</TableCell>
                  <TableCell>{new Date(challan.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{challan.customer?.customerName}</span>
                      {challan.customer?.businessName && <span className="text-xs text-slate-500">{challan.customer.businessName}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      challan.status === 'CONFIRMED' ? 'success' : 
                      challan.status === 'CANCELLED' ? 'error' : 'default'
                    }>
                      {challan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{challan.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/challans/${challan.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                    </Link>
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
    </div>
  );
}
