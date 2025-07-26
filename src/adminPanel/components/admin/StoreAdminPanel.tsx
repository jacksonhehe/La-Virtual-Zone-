import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStoreStore, Product, Rarity } from '../../store/storeStore';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

const initialForm = {
  name: '',
  description: '',
  category: '',
  rarity: 'comun' as Rarity,
  price: 0,
  tags: '' as string,
  stockLimited: false,
  stock: 0,
  image: '',
  launchAt: '',
  expireAt: '',
  featured: false,
};

const StoreAdminPanel = () => {
  const { addStoreItem } = useStoreStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  const handleSave = () => {
    if (!form.name.trim() || !form.category.trim() || form.price <= 0) {
      toast.error('Nombre, categoría y precio son obligatorios.');
      return;
    }
    const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'active'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      rarity: form.rarity,
      price: form.price,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      image: form.image,
      featured: form.featured,
      launchAt: form.launchAt || undefined,
      expireAt: form.expireAt || undefined,
      stock: form.stockLimited ? form.stock : null,
    } as any;
    addStoreItem(productData);
    toast.success('Producto creado');
    setShowModal(false);
    setForm(initialForm);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700/40 to-blue-700/40 p-8 border border-purple-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">Tienda de Objetos</h1>
        <p className="text-gray-300 mb-4 max-w-xl">Administra los artículos de la tienda, colecciones especiales y el historial de compras de los usuarios.</p>
        <button className="btn-primary flex items-center space-x-2" onClick={() => setShowModal(true)} aria-label="Nuevo artículo">
          <Plus size={18} />
          <span>Nuevo artículo</span>
        </button>
      </div>

      {/* KPI placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Ventas (Mes)</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">0</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Ítems activos</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">0</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Z-Coins gastadas</h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">0</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Producto top</h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">-</p>
        </div>
      </div>

      {/* Placeholder catalog */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 min-h-[300px] flex items-center justify-center text-gray-500">
        Catálogo próximamente...
      </div>

      {/* Placeholder purchase history */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 min-h-[300px] flex items-center justify-center text-gray-500">
        Historial de compras próximamente...
      </div>

      {/* Modal Nuevo Artículo */}
      <Modal open={showModal} onClose={()=>{setShowModal(false); setForm(initialForm);}} className="w-full max-w-xl">
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-4">Nuevo Artículo</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-gray-300">Nombre *</label>
                <input className="input w-full mt-1" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Descripción</label>
                <textarea className="input w-full mt-1" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Categoría *</label>
                  <input className="input w-full mt-1" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Rareza</label>
                  <select className="input w-full mt-1" value={form.rarity} onChange={e=>setForm({...form,rarity:e.target.value as Rarity})}>
                    <option value="comun">Común</option>
                    <option value="raro">Raro</option>
                    <option value="epico">Épico</option>
                    <option value="legendario">Legendario</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Precio (Z-Coins) *</label>
                  <input type="number" min="1" className="input w-full mt-1" value={form.price} onChange={e=>setForm({...form,price:parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Tags (coma) </label>
                  <input className="input w-full mt-1" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-sm text-gray-300 flex items-center space-x-2"><input type="checkbox" className="mr-1" checked={form.stockLimited} onChange={e=>setForm({...form,stockLimited:e.target.checked})} /> <span>Stock limitado</span></label>
                  {form.stockLimited && (
                    <input type="number" min="1" className="input w-full mt-1" value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value)})} />
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-300">Imagen URL</label>
                  <input className="input w-full mt-1" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Lanzamiento</label>
                  <input type="datetime-local" className="input w-full mt-1" value={form.launchAt} onChange={e=>setForm({...form,launchAt:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Expiración</label>
                  <input type="datetime-local" className="input w-full mt-1" value={form.expireAt} onChange={e=>setForm({...form,expireAt:e.target.value})} />
                </div>
              </div>
              <label className="text-sm text-gray-300 flex items-center space-x-2"><input type="checkbox" className="mr-1" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> <span>Destacado</span></label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={()=>{setShowModal(false); setForm(initialForm);}}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
            <button aria-label="Cerrar" onClick={()=>{setShowModal(false); setForm(initialForm);}} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white">✕</button>
          </div>
      </Modal>
      )
    </div>
  );
};

export default StoreAdminPanel; 