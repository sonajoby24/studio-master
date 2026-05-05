'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '@/context/product-context';
import { useOrders } from '@/context/order-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { IndianRupee, Package, ShoppingCart, ArrowUpDown, Loader2, PackageCheck, PackageX, Trash2, Pencil, PlusCircle, View } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import type { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuote } from '@/context/quote-context';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { 
    products, 
    deleteProduct, 
    addColumn, 
    deleteColumn, 
    loading: productsLoading, 
    productKeys, 
    setColumnOrder: setContextColumnOrder, 
    headerNames, 
    renameColumn,
    homePageFieldOrder,
    setHomePageFieldOrder,
    homePageVisibleFields,
    toggleHomePageFieldVisibility,
    adminTableVisibleFields,
    toggleAdminTableFieldVisibility,
    updateProductField,
    selectedProducts,
    toggleProductSelection,
    toggleSelectAllProducts,
    clearSelection,
  } = useProducts();

  const { orders } = useOrders();
  const { addItemToQuote, setIsQuoteSheetOpen } = useQuote();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | string | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalSales = orders.length;

  const visibleProductKeys = useMemo(() => {
    return productKeys.filter(key => adminTableVisibleFields[key]);
  }, [productKeys, adminTableVisibleFields]);

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableProducts = [...products];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      sortableProducts = sortableProducts.filter(p =>
        Object.values(p).some(v => String(v).toLowerCase().includes(lower))
      );
    }

    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        const key = sortConfig.key as string;

        let aValue, bValue;

        if (key === 'quoteTotal') {
          aValue = (a.qtyForQuote || 0) * (a.price || 0);
          bValue = (b.qtyForQuote || 0) * (b.price || 0); // ✅ FIXED
        } else {
          aValue = a[key as keyof Product] ?? '';
          bValue = b[key as keyof Product] ?? '';
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return sortableProducts;
  }, [products, searchTerm, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const visibleIds = useMemo(() => sortedAndFilteredProducts.map(p => p.productId), [sortedAndFilteredProducts]);

  const allSelected = useMemo(() => {
    if (selectedProducts.length === 0) return false;
    return visibleIds.every(id => selectedProducts.includes(id));
  }, [selectedProducts, visibleIds]);

  const handleSelectAll = () => {
    toggleSelectAllProducts(visibleIds);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>₹{totalRevenue.toFixed(2)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent>{totalSales}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>{products.length}</CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Products</CardTitle>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>

                {/* ✅ FIXED CHECKBOX HEADER */}
                <TableHead className="w-[50px]">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                </TableHead>

                {visibleProductKeys.map(key => (
                  <TableHead key={key}>
                    <button onClick={() => requestSort(key)}>
                      {headerNames[key] || key} <ArrowUpDown className="inline w-4 h-4" />
                    </button>
                  </TableHead>
                ))}

              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedAndFilteredProducts.map(product => (
                <TableRow key={product.productId}>

                  {/* CHECKBOX CELL */}
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.productId)}
                      onCheckedChange={() => toggleProductSelection(product.productId)}
                    />
                  </TableCell>

                  {visibleProductKeys.map(key => (
                    <TableCell key={key}>
                      {key === 'quoteTotal'
                        ? (product.qtyForQuote || 0) * (product.price || 0)
                        : product[key as keyof Product]}
                    </TableCell>
                  ))}

                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  );
}