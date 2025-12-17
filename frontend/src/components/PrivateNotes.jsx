import React, { useState, useEffect } from 'react';
import { Send, Trash2, Edit2, AlertTriangle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PrivateNotes = ({ clientId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // --- SEGURIDAD VISUAL ---
  // Obtenemos el ID del usuario conectado para saber qué notas son suyas
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');

  // --- ESTADOS PARA EDICIÓN ---
  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');     

  // Estado para el modal de borrar
  const [noteToDelete, setNoteToDelete] = useState(null); 

  useEffect(() => {
    if (clientId) {
        fetchNotes();
        setEditingId(null); 
    }
  }, [clientId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/v1/notas/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotes(await response.json());
      }
    } catch (error) {
      console.error("Error cargando notas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/notas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenido: newNote, id_cliente: clientId })
      });

      if (response.ok) {
        setNewNote('');
        fetchNotes(); 
        toast.success("Nota guardada");
      }
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  // --- FUNCIONES DE EDICIÓN ---
  const startEditing = (nota) => {
    setEditingId(nota.id);
    setEditText(nota.contenido);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/v1/notas/${editingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ contenido: editText, id_cliente: clientId })
        });

        if (response.ok) {
            toast.success("Nota actualizada");
            fetchNotes();
            setEditingId(null);
        } else {
            toast.error("No tienes permiso para editar");
        }
    } catch (error) {
        console.error(error);
        toast.error("Error al actualizar");
    }
  };

  // --- FUNCIONES DE BORRADO ---
  const handleDeleteClick = (idNota) => {
    setNoteToDelete(idNota);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/v1/notas/${noteToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Nota eliminada");
        fetchNotes(); 
      } else {
        toast.error("No tienes permiso para borrar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setNoteToDelete(null); 
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Lista de Notas */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3 min-h-[100px] max-h-[300px]">
        {loading ? <p className="text-sm text-center text-gray-400 mt-4">Cargando...</p> : 
         notes.length === 0 ? <div className="text-center text-gray-400 text-sm mt-4 italic">No hay notas registradas.</div> :
         notes.map(nota => {
           const isEditing = editingId === nota.id;
           
           // El ID de localStorage suele ser texto ("2"), y el de la nota número (2).
            const isOwner = Number(nota.id_usuario) === Number(currentUserId);

            // 🕵️ DEBUG TEMPORAL: Mira la consola (F12) si los botones no salen
            // console.log(`Nota ${nota.id}: Dueño=${nota.id_usuario}, Tú=${currentUserId}, ¿Es tuya? ${isOwner}`);

           return (
           <div key={nota.id} className={`p-3 rounded-lg border shadow-sm text-sm relative group transition ${isEditing ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-orange-100 hover:shadow-md'}`}>
             
             {isEditing ? (
                 // --- MODO EDICIÓN ---
                 <div className="animate-in fade-in duration-200">
                    <textarea 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 mb-2 resize-none"
                        rows="3"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={cancelEditing} className="p-1 px-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1">
                            <X size={12}/> Cancelar
                        </button>
                        <button onClick={saveEdit} className="p-1 px-2 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-1 shadow-sm">
                            <Check size={12}/> Guardar
                        </button>
                    </div>
                 </div>
             ) : (
                 // --- MODO VISUALIZACIÓN ---
                 <>
                    {/* 🔥 SOLO MOSTRAMOS BOTONES SI ES EL PROPIETARIO */}
                    {isOwner && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => startEditing(nota)}
                                className="text-gray-300 hover:text-blue-500 p-1 hover:bg-blue-50 rounded"
                                title="Editar nota"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(nota.id)}
                                className="text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                                title="Borrar nota"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}

                    <p className="text-gray-700 whitespace-pre-wrap pr-10 text-[13px]">{nota.contenido}</p>
                    <p className="text-[10px] text-gray-400 mt-2 text-right font-mono">
                        {/* Opcional: Mostrar quién escribió la nota si NO soy yo */}
                        {!isOwner && <span className="mr-2 font-bold text-orange-400">Escrito por comercial</span>}
                        {new Date(nota.fecha_creacion).toLocaleString()}
                    </p>
                 </>
             )}
           </div>
         )})
        }
      </div>

      {/* Input para nueva nota */}
      {!editingId && (
          <div className="flex gap-2 pt-2">
            <input 
              type="text" 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Escribe una nota rápida..."
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-sm transition shadow-sm"
            />
            <button 
              onClick={handleSave}
              className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 transition shadow-lg flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {noteToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-xl">
           <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 w-full max-w-[90%] text-center animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                 <AlertTriangle size={20} />
              </div>
              <h4 className="text-gray-800 font-bold mb-1">¿Eliminar nota?</h4>
              <p className="text-xs text-gray-500 mb-4">Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 justify-center">
                 <button onClick={() => setNoteToDelete(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                 <button onClick={confirmDelete} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition">Sí, eliminar</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default PrivateNotes;