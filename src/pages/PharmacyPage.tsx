import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Medicine } from '../types';
import MedicineForm from '../components/pharmacy/MedicineForm';
import Pagination from '../components/common/Pagination';

const ITEMS_PER_PAGE = 10;

// Mock data - replace with actual API calls
const mockMedicines: Medicine[] = [
  {
    id: 1,
    name: 'Amoxicillin',
    type: 'tablet',
    description: 'Antibiotic for bacterial infections',
    manufacturer: 'PharmaCorp',
    stock: 500,
    unit: 'tablets',
    price: 0.5,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  // Add more mock medicines as needed
];

const PharmacyPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMedicines = filteredMedicines.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddMedicine = (medicine: Medicine) => {
    // In a real app, this would be an API call
    const newMedicine = {
      ...medicine,
      id: medicines.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMedicines([newMedicine, ...medicines]);
    setShowForm(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="slide-in">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl font-bold text-neutral-900">Pharmacy Stock</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add New Medicine
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* Medicines list */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Unit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Manufacturer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedMedicines.length > 0 ? (
              paginatedMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900">{medicine.name}</div>
                      {medicine.description && (
                        <div className="text-sm text-neutral-500">{medicine.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-800">
                      {medicine.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`font-medium ${
                        medicine.stock > 100
                          ? 'text-success-600'
                          : medicine.stock > 20
                          ? 'text-warning-600'
                          : 'text-error-600'
                      }`}
                    >
                      {medicine.stock}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {medicine.unit}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    ${medicine.price.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {medicine.manufacturer || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {new Date(medicine.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-neutral-500">
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredMedicines.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Medicine Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Add New Medicine</h2>
            <MedicineForm
              onSubmit={handleAddMedicine}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPage;