import { useState } from 'react';
import { Medicine, MedicineType } from '../../types';

interface MedicineFormProps {
  medicine?: Partial<Medicine>;
  onSubmit: (medicine: Medicine) => void;
  onCancel: () => void;
}

const MedicineForm = ({ medicine, onSubmit, onCancel }: MedicineFormProps) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: medicine?.name || '',
    type: medicine?.type || 'tablet',
    description: medicine?.description || '',
    manufacturer: medicine?.manufacturer || '',
    stock: medicine?.stock || 0,
    unit: medicine?.unit || 'tablets',
    price: medicine?.price || 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Medicine, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof Medicine]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Medicine, string>> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Medicine name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Medicine type is required';
    }
    
    if (formData.stock === undefined || formData.stock < 0) {
      newErrors.stock = 'Stock must be a positive number';
    }
    
    if (!formData.unit?.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit(formData as Medicine);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Medicine Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input mt-1 block w-full ${errors.name ? 'border-error-500 ring-error-500' : ''}`}
        />
        {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-neutral-700">
          Type*
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`input mt-1 block w-full ${errors.type ? 'border-error-500 ring-error-500' : ''}`}
        >
          <option value="tablet">Tablet</option>
          <option value="injection">Injection</option>
          <option value="syrup">Syrup</option>
          <option value="capsule">Capsule</option>
          <option value="cream">Cream</option>
          <option value="drops">Drops</option>
          <option value="powder">Powder</option>
          <option value="other">Other</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-error-500">{errors.type}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="input mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="manufacturer" className="block text-sm font-medium text-neutral-700">
          Manufacturer
        </label>
        <input
          type="text"
          id="manufacturer"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          className="input mt-1 block w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-neutral-700">
            Stock*
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={`input mt-1 block w-full ${errors.stock ? 'border-error-500 ring-error-500' : ''}`}
          />
          {errors.stock && <p className="mt-1 text-sm text-error-500">{errors.stock}</p>}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-neutral-700">
            Unit*
          </label>
          <input
            type="text"
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g., tablets, ml, etc."
            className={`input mt-1 block w-full ${errors.unit ? 'border-error-500 ring-error-500' : ''}`}
          />
          {errors.unit && <p className="mt-1 text-sm text-error-500">{errors.unit}</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700">
            Price*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`input mt-1 block w-full ${errors.price ? 'border-error-500 ring-error-500' : ''}`}
          />
          {errors.price && <p className="mt-1 text-sm text-error-500">{errors.price}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {medicine ? 'Update Medicine' : 'Add Medicine'}
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;