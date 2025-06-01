import { useState } from 'react';
import { Search, Phone, User } from 'lucide-react';
import { Medicine, PharmacySale, PharmacySaleItem, PharmacyCustomer } from '../types';
import { useMedicines } from '../hooks/useApi';
import api from '../services/api';

interface SaleItem {
  medicine: Medicine;
  quantity: number;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const PharmacyPOSPage = () => {
  const { data: medicines = [], isLoading, refetch: refetchMedicines } = useMedicines();
  const [searchTerm, setSearchTerm] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Customer state
  const [phoneSearch, setPhoneSearch] = useState('');
  const [customer, setCustomer] = useState<PharmacyCustomer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      setCustomerError('Please enter a phone number');
      return;
    }

    try {
      setIsSearching(true);
      setCustomerError(null);

      const foundCustomer = await api.pharmacyCustomers.getByPhone(phoneSearch);
      
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setShowCustomerForm(false);
      } else {
        // No customer found - show the form
        setCustomerFormData({
          name: '',
          phone: phoneSearch,
          email: '',
          address: '',
        });
        setShowCustomerForm(true);
      }
    } catch (error) {
      console.error('Failed to search customer:', error);
      // Show form on error as well
      setCustomerFormData({
        name: '',
        phone: phoneSearch,
        email: '',
        address: '',
      });
      setShowCustomerForm(true);
      setCustomerError('Customer not found. Please enter details.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerFormData.name || !customerFormData.phone) {
      setCustomerError('Name and phone number are required');
      return;
    }

    try {
      const newCustomer = await api.pharmacyCustomers.create({
        ...customerFormData,
        createdAt: new Date().toISOString(),
      });
      setCustomer(newCustomer);
      setShowCustomerForm(false);
      setCustomerError(null);
    } catch (error) {
      console.error('Failed to create customer:', error);
      setCustomerError('Failed to create customer');
    }
  };

  const addMedicineToSale = (medicine: Medicine) => {
    setSaleItems((prev) => {
      const existingItem = prev.find((item) => item.medicine.id === medicine.id);
      if (existingItem) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity < 0) return;
    
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine && quantity > medicine.stock) {
      alert(`Only ${medicine.stock} units available`);
      return;
    }

    setSaleItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const calculateSubtotal = () => {
    return saleItems.reduce(
      (total, item) => total + item.medicine.price * item.quantity,
      0
    );
  };

  const calculateSGST = () => {
    return calculateSubtotal() * 0.09; // 9% SGST
  };

  const calculateCGST = () => {
    return calculateSubtotal() * 0.09; // 9% CGST
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const sgst = calculateSGST();
    const cgst = calculateCGST();
    const total = subtotal + sgst + cgst;
    return total - (discount || 0);
  };

  const handleCompleteSale = async () => {
    if (isProcessing || saleItems.length === 0 || !customer) {
      if (!customer) {
        setCustomerError('Please enter customer details before completing sale');
      }
      return;
    }

    try {
      setIsProcessing(true);

      const subtotal = calculateSubtotal();
      const sgst = calculateSGST();
      const cgst = calculateCGST();
      const total = calculateTotal();

      const sale: PharmacySale = {
        id: 0,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: saleItems.map((item): PharmacySaleItem => ({
          medicineId: item.medicine.id,
          medicineName: item.medicine.name,
          quantity: item.quantity,
          unitPrice: item.medicine.price,
          totalPrice: item.medicine.price * item.quantity
        })),
        subtotal,
        sgst,
        cgst,
        discount,
        total,
        createdAt: new Date().toISOString()
      };

      await api.pharmacySales.create(sale);
      
      // Reset form
      setSaleItems([]);
      setDiscount(0);
      setCustomer(null);
      setPhoneSearch('');
      refetchMedicines();

      alert('Sale completed successfully!');
    } catch (error) {
      console.error('Failed to complete sale:', error);
      alert('Failed to complete sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-neutral-500">Loading medicines...</p>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Pharmacy POS</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left side - Medicine selection */}
        <div>
          <div className="mb-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="h-[calc(100vh-300px)] overflow-y-auto rounded-lg border border-neutral-200 bg-white">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900">
                          {medicine.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {medicine.type}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-neutral-500">
                      {medicine.stock} {medicine.unit}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-neutral-900">
                      ₹{medicine.price.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => addMedicineToSale(medicine)}
                        disabled={medicine.stock === 0}
                        className="text-primary-500 hover:text-primary-700 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side - Current sale */}
        <div className="space-y-6">
          {/* Customer Search/Form */}
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Customer Details
            </h2>
            
            {!customer && !showCustomerForm && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="tel"
                      className="input pl-10 w-full"
                      placeholder="Enter phone number..."
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handlePhoneSearch}
                    className="btn-primary"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {customerError && (
                  <p className="text-sm text-error-500">{customerError}</p>
                )}
              </div>
            )}

            {showCustomerForm && (
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Name*
                  </label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    value={customerFormData.name}
                    onChange={(e) => setCustomerFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Phone*
                  </label>
                  <input
                    type="tel"
                    className="input mt-1 w-full"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input mt-1 w-full"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Address
                  </label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    value={customerFormData.address}
                    onChange={(e) => setCustomerFormData(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerForm(false);
                      setCustomerError(null);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Customer
                  </button>
                </div>

                {customerError && (
                  <p className="text-sm text-error-500">{customerError}</p>
                )}
              </form>
            )}

            {customer && (
              <div className="rounded-lg bg-neutral-50 p-4">
                <div className="flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">{customer.name}</h3>
                    <p className="text-sm text-neutral-500">{customer.phone}</p>
                    {customer.email && (
                      <p className="text-sm text-neutral-500">{customer.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Current Sale
            </h2>
            <div className="space-y-4">
              {saleItems.map((item) => (
                <div
                  key={item.medicine.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.medicine.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      ₹{item.medicine.price.toFixed(2)} per {item.medicine.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.medicine.id, item.quantity - 1)
                      }
                      className="rounded-full bg-neutral-100 p-1 text-neutral-600 hover:bg-neutral-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.medicine.id, item.quantity + 1)
                      }
                      className="rounded-full bg-neutral-100 p-1 text-neutral-600 hover:bg-neutral-200"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">
                      ₹{(item.medicine.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">SGST (9%):</span>
                <span className="font-medium">₹{calculateSGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">CGST (9%):</span>
                <span className="font-medium">₹{calculateCGST().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="input w-24 text-right"
                />
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-neutral-900">
                    Grand Total:
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={saleItems.length === 0 || isProcessing || !customer}
            className="btn-primary w-full"
          >
            {isProcessing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyPOSPage;