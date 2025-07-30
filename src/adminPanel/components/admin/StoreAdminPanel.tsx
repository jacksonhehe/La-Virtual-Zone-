import React, { useState } from 'react';
import Image from '@/components/ui/Image';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStoreSlice, PurchaseTx } from '../../../store/storeSlice';
import { StoreItem } from '../../../types';
type Rarity = NonNullable<StoreItem['rarity']>;
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

const initialForm = {
  name: '',
  description: '',
  category: '',
  rarity: 'common' as Rarity,
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
  const { addStoreItem, updateStoreItem, removeStoreItem, products } = useStoreSlice();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingProduct, setEditingProduct] = useState<StoreItem | null>(null);

  const { purchases, refundPurchase } = useStoreSlice();

  const [filterUser, setFilterUser] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'success' | 'refunded'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredPurchases = purchases.filter((tx)=>{
    if(filterUser && !tx.userId.includes(filterUser)) return false;
    if(filterProduct && !tx.productId.includes(filterProduct)) return false;
    if(filterState!=='all' && tx.status!==filterState) return false;
    const ts = new Date(tx.date).getTime();
    if(dateFrom && ts < new Date(dateFrom).getTime()) return false;
    if(dateTo && ts > new Date(dateTo).getTime()) return false;
    return true;
  });

  const exportCsv = () => {
    const rows = [
      ['ID','Producto','Usuario','Fecha','Estado'],
      ...filteredPurchases.map(p=>[p.id,p.productId,p.userId,p.date,p.status])
    ];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;
    a.download='compras.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.category.trim() || form.price <= 0) {
      toast.error('Nombre, categoría y precio son obligatorios.');
      return;
    }
    const productData = {
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
    if(editingProduct){
      updateStoreItem(editingProduct.id, productData);
      toast.success('Producto actualizado');
    } else {
      addStoreItem(productData);
      toast.success('Producto creado');
    }
    setShowModal(false);
    setForm(initialForm);
    setEditingProduct(null);
  };

  /* helpers para rareza */
  const rarityRing = (rarity: Rarity | undefined) => {
    switch(rarity){
      case 'rare': return 'ring-2 ring-neon-blue';
      case 'epic': return 'ring-2 ring-neon-purple';
      case 'legendary': return 'ring-2 ring-neon-yellow';
      default: return '';
    }
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

      {/* Catálogo real */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p=> (
            <div key={p.id} className="relative group rounded-xl overflow-hidden border border-gray-700/40 bg-gray-900/40">
              <Image
                src={p.image}
                alt={p.name}
                height={160}
                className={`w-full h-40 object-cover ${rarityRing(p.rarity)}`}
                style={{ width: '100%' }}
              />
              <div className="p-4 space-y-1">
                <h3 className="text-white font-semibold flex items-center justify-between">
                  {p.name}
                  {p.featured && <span className="text-xs text-yellow-400" title="Destacado">★</span>}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary">{p.price} ZC</span>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button aria-label="Editar" title="Editar" className="text-blue-400 hover:text-blue-300" onClick={()=>{setEditingProduct(p); setForm({
                      name:p.name,
                      description:p.description,
                      category:p.category,
                      rarity:(p.rarity||'common') as Rarity,
                      price:p.price,
                      tags:(p.tags||[]).join(', '),
                      stockLimited:p.stock!==null && p.stock!==undefined,
                      stock:p.stock??0,
                      image:p.image,
                      launchAt:p.launchAt||'',
                      expireAt:p.expireAt||'',
                      featured:!!p.featured,
                    }); setShowModal(true);}}>
                      ✏️
                    </button>
                    <button aria-label="Eliminar" title="Eliminar" className="text-red-400 hover:text-red-300" onClick={()=>{ if(confirm('¿Eliminar?')){ removeStoreItem(p.id); toast.success('Producto eliminado');}}}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de compras */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Historial de compras</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input placeholder="Filtrar usuario" className="input" value={filterUser} onChange={e=>setFilterUser(e.target.value)} />
          <input placeholder="Filtrar producto" className="input" value={filterProduct} onChange={e=>setFilterProduct(e.target.value)} />
          <select className="input" value={filterState} onChange={e=>setFilterState(e.target.value as any)}>
            <option value="all">Todos</option>
            <option value="success">Entregados</option>
            <option value="refunded">Revertidos</option>
          </select>
          <input type="date" className="input" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
          <input type="date" className="input" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700 text-xs">
                <th className="py-2">ID</th>
                <th className="py-2">Producto</th>
                <th className="py-2">Usuario</th>
                <th className="py-2">Fecha</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map(tx=> (
                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2">{tx.id.slice(0,6)}…</td>
                  <td className="py-2">{tx.productId}</td>
                  <td className="py-2">{tx.userId}</td>
                  <td className="py-2">{new Date(tx.date).toLocaleString()}</td>
                  <td className="py-2">
                    {tx.status==='success' ? (
                      <button aria-label="Revertir" className="text-yellow-400" onClick={()=>{refundPurchase(tx.id); toast.success('Compra revertida');}}>
                        Revertir
                      </button>
                    ) : (
                      <span className="text-red-400">Revertido</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPurchases.length===0 && (<tr><td colSpan={5} className="text-center py-6 text-gray-500">Sin resultados</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn-secondary" onClick={exportCsv}>Exportar CSV</button>
        </div>
      </div>

      {/* Modal Nuevo Artículo */}
      <Modal open={showModal} onClose={()=>{setShowModal(false); setForm(initialForm); setEditingProduct(null);}} className="w-full max-w-xl">
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-4">{editingProduct? 'Editar Artículo':'Nuevo Artículo'}</h2>
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
                    <option value="common">Común</option>
                    <option value="rare">Raro</option>
                    <option value="epic">Épico</option>
                    <option value="legendary">Legendario</option>
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
              <Button variant="outline" onClick={()=>{setShowModal(false); setForm(initialForm); setEditingProduct(null);}}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
            <button aria-label="Cerrar" onClick={()=>{setShowModal(false); setForm(initialForm); setEditingProduct(null);}} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white">✕</button>
          </div>
      </Modal>
      )
    </div>
  );
};

export default StoreAdminPanel; 
