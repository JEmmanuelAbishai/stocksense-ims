import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Plus,
  Edit2,
  Users,
  Layers,
  Save,
  CheckCircle,
  Package,
  Boxes
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Warehouse, WarehouseLocation } from '../../types/inventory';

export const SettingsView: React.FC = () => {
  const { warehouses, addWarehouse, updateWarehouse } = useInventory();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  // New warehouse state
  const [newWhName, setNewWhName] = useState('');
  const [newWhCode, setNewWhCode] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');
  const [newWhManager, setNewWhManager] = useState('');
  const [newWhCapacity, setNewWhCapacity] = useState('10000');

  // New location state
  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');
  const [newLocZone, setNewLocZone] = useState('General Storage');
  const [newLocType, setNewLocType] = useState<'rack' | 'dock' | 'floor' | 'bulk'>('rack');

  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhCode.trim()) return;

    addWarehouse({
      code: newWhCode.toUpperCase(),
      name: newWhName,
      address: newWhAddress,
      manager: newWhManager || 'Operations Lead',
      maxCapacity: parseInt(newWhCapacity, 10) || 10000,
      currentOccupancy: 0,
      capacityUnit: 'm³',
      locations: [
        { id: `loc-def-${Date.now()}`, code: 'DOCK-01', name: 'Primary Inbound Dock', zone: 'Staging', type: 'dock' },
        { id: `loc-rck-${Date.now()}`, code: 'RCK-01', name: 'Pallet Rack A1', zone: 'Main Storage', type: 'rack' }
      ]
    });

    setNewWhName('');
    setNewWhCode('');
    setNewWhAddress('');
    setNewWhManager('');
    setShowAddWarehouseModal(false);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocCode.trim() || !activeWarehouse) return;

    const newLoc: WarehouseLocation = {
      id: `loc-${Date.now()}`,
      code: newLocCode.toUpperCase(),
      name: newLocName,
      zone: newLocZone,
      type: newLocType
    };

    updateWarehouse(activeWarehouse.id, {
      locations: [...activeWarehouse.locations, newLoc]
    });

    setNewLocName('');
    setNewLocCode('');
    setShowAddLocationModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#1e3a34] uppercase mb-1">
            FACILITIES & ZONES
          </div>
          <h1 className="text-3xl font-extrabold text-[#1c2a27] tracking-tight">
            Warehouse Architecture
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Configure multi-facility docks, storage racks, and operational thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowAddWarehouseModal(true)}
          className="px-4 py-2.5 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Warehouse</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Warehouse List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">
            Registered Facilities ({warehouses.length})
          </h3>

          <div className="space-y-3">
            {warehouses.map(wh => {
              const isSelected = wh.id === activeWarehouse?.id;
              const percent = Math.round((wh.currentOccupancy / wh.maxCapacity) * 100);

              return (
                <div
                  key={wh.id}
                  onClick={() => setSelectedWarehouseId(wh.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#1e3a34] shadow-md ring-1 ring-[#1e3a34]/30'
                      : 'bg-white/70 border-stone-200 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#1e3a34]">{wh.code}</span>
                    <span className="text-[11px] text-stone-500">{wh.locations.length} racks/zones</span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 mt-1">{wh.name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{wh.address}</p>

                  <div className="mt-4 pt-3 border-t border-stone-100 text-xs flex items-center justify-between text-stone-600">
                    <span>{wh.manager}</span>
                    <span className="font-mono font-bold text-[#1e3a34]">{percent}% utilized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Details & Racks */}
        {activeWarehouse && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#1e3a34]">{activeWarehouse.code}</span>
                    <span className="text-stone-300">·</span>
                    <h3 className="text-lg font-bold text-stone-900">{activeWarehouse.name}</h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{activeWarehouse.address}</p>
                </div>

                <button
                  onClick={() => setShowAddLocationModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1e3a34]" />
                  <span>Add Rack / Zone</span>
                </button>
              </div>

              {/* Progress */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Volumetric Occupancy:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {activeWarehouse.currentOccupancy.toLocaleString()} / {activeWarehouse.maxCapacity.toLocaleString()} {activeWarehouse.capacityUnit}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1e3a34] rounded-full transition-all"
                    style={{ width: `${Math.round((activeWarehouse.currentOccupancy / activeWarehouse.maxCapacity) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Locations Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Internal Storage Zones ({activeWarehouse.locations.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeWarehouse.locations.map(loc => (
                    <div
                      key={loc.id}
                      className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 flex items-start justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1e3a34]">{loc.code}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200 font-semibold">
                            {loc.type}
                          </span>
                        </div>
                        <div className="font-bold text-stone-900">{loc.name}</div>
                        <div className="text-[11px] text-stone-500">Zone: {loc.zone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Warehouse Modal */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Add Warehouse Facility</h3>
            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Facility Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Transit Distribution Center"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-04"
                    value={newWhCode}
                    onChange={(e) => setNewWhCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-mono uppercase text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Capacity (m³)</label>
                  <input
                    type="number"
                    value={newWhCapacity}
                    onChange={(e) => setNewWhCapacity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Industrial Way, Bay 3"
                  value={newWhAddress}
                  onChange={(e) => setNewWhAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Facility Manager</label>
                <input
                  type="text"
                  placeholder="e.g. David Ross"
                  value={newWhManager}
                  onChange={(e) => setNewWhManager(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWarehouseModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white font-bold"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">
              Add Location to {activeWarehouse.code}
            </h3>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Rack / Location Name *</label>
                <input
                  type="text"
                  placeholder="e.g. High-Bay Rack C3"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Location Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. RCK-C3"
                    value={newLocCode}
                    onChange={(e) => setNewLocCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-mono uppercase text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Type</label>
                  <select
                    value={newLocType}
                    onChange={(e) => setNewLocType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                  >
                    <option value="rack">Rack (High-Bay)</option>
                    <option value="dock">Dock (Staging/Dispatch)</option>
                    <option value="floor">Floor (Manufacturing)</option>
                    <option value="bulk">Bulk Pallet Bay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Zone Area</label>
                <input
                  type="text"
                  placeholder="e.g. Zone C"
                  value={newLocZone}
                  onChange={(e) => setNewLocZone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white font-bold"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
