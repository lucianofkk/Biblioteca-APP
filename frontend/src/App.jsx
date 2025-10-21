import { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, ArrowLeft, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from './services/api';

// Componente de notificación
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2">
        <X size={16} />
      </button>
    </div>
  );
};

// Componente principal
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [libros, setLibros] = useState([]);
  const [socios, setSocios] = useState([]);
  const [multas, setMultas] = useState([]);
  const [prestamosActivos, setPrestamosActivos] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);

  // Formularios
  const [libroForm, setLibroForm] = useState({ titulo: '', autor: '', isbn: '' });
  const [socioForm, setSocioForm] = useState({ nombre: '', numero_socio: '' });
  const [prestamoForm, setPrestamoForm] = useState({ 
    socio_id: '', 
    libro_id: '', 
    fecha_inicio: new Date().toISOString().split('T')[0] 
  });

  // Handlers optimizados
  const handleLibroChange = (field, value) => {
    setLibroForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSocioChange = (field, value) => {
    setSocioForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePrestamoChange = (field, value) => {
    setPrestamoForm(prev => ({ ...prev, [field]: value }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Cargar datos
  const cargarLibros = async () => {
    try {
      const { data } = await api.get('/libros');
      setLibros(data);
    } catch (error) {
      showNotification('Error al cargar libros', 'error');
    }
  };

  const cargarSocios = async () => {
    try {
      const { data } = await api.get('/socios');
      setSocios(data);
    } catch (error) {
      showNotification('Error al cargar socios', 'error');
    }
  };

  const cargarMultas = async () => {
    try {
      const { data } = await api.get('/prestamos/multas');
      setMultas(data);
    } catch (error) {
      showNotification('Error al cargar multas', 'error');
    }
  };

  const cargarPrestamosActivos = async () => {
    try {
      const { data } = await api.get('/prestamos');
      setPrestamosActivos(data);
    } catch (error) {
      showNotification('Error al cargar préstamos', 'error');
    }
  };

  useEffect(() => {
    cargarLibros();
    cargarSocios();
    cargarMultas();
    cargarPrestamosActivos();
  }, []);

  // Crear libro
  const handleCrearLibro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/libros', libroForm);
      showNotification('Libro agregado correctamente');
      setLibroForm({ titulo: '', autor: '', isbn: '' });
      cargarLibros();
    } catch (error) {
      showNotification('Error al agregar libro', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear socio
  const handleCrearSocio = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/socios', socioForm);
      showNotification('Socio registrado correctamente');
      setSocioForm({ nombre: '', numero_socio: '' });
      cargarSocios();
    } catch (error) {
      showNotification('Error al registrar socio', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear préstamo
  const handleCrearPrestamo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/prestamos', prestamoForm);
      showNotification('Préstamo registrado correctamente');
      setPrestamoForm({ 
        socio_id: '', 
        libro_id: '', 
        fecha_inicio: new Date().toISOString().split('T')[0] 
      });
      cargarLibros();
      cargarPrestamosActivos();
    } catch (error) {
      showNotification('Error al registrar préstamo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de devolución
  const abrirModalDevolucion = (prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setShowDevolucionModal(true);
  };

  // Registrar devolución
  const handleDevolucion = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const libroDanado = formData.get('libro_danado') === 'true';
    const montoMulta = parseFloat(formData.get('monto_multa')) || 0;
    const motivo = formData.get('motivo') || '';

    try {
      await api.put(`/prestamos/${prestamoSeleccionado.id}/devolver`, {
        fecha_devolucion: new Date().toISOString().split('T')[0],
        libro_danado: libroDanado,
        monto_multa: montoMulta,
        motivo: motivo
      });
      showNotification('Devolución registrada correctamente');
      setShowDevolucionModal(false);
      setPrestamoSeleccionado(null);
      cargarLibros();
      cargarMultas();
      cargarPrestamosActivos();
    } catch (error) {
      showNotification('Error al registrar devolución', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Vista Home
  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            📚 Sistema de Gestión de Biblioteca
          </h1>
          <p className="text-xl text-indigo-600">Gestiona libros, socios y préstamos de forma simple</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <button
            onClick={() => setCurrentView('libros')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
          >
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Libros</h2>
            <p className="text-gray-600">Gestiona el catálogo de libros</p>
            <div className="mt-4 text-3xl font-bold text-blue-600">{libros.length}</div>
          </button>

          <button
            onClick={() => setCurrentView('socios')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
          >
            <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Socios</h2>
            <p className="text-gray-600">Administra los socios</p>
            <div className="mt-4 text-3xl font-bold text-green-600">{socios.length}</div>
          </button>

          <button
            onClick={() => setCurrentView('prestamos')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
          >
            <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Préstamos</h2>
            <p className="text-gray-600">Registra préstamos y devoluciones</p>
            <div className="mt-4 text-3xl font-bold text-purple-600">
              {libros.filter(l => l.estado === 'prestado').length}
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Vista Libros
  const LibrosView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => setCurrentView('home')} className="hover:bg-blue-700 p-2 rounded">
            <ArrowLeft />
          </button>
          <h1 className="text-3xl font-bold">Gestión de Libros</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-600" />
            Agregar Nuevo Libro
          </h2>
          <form onSubmit={handleCrearLibro} className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Título"
              value={libroForm.titulo}
              onChange={(e) => handleLibroChange('titulo', e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Autor"
              value={libroForm.autor}
              onChange={(e) => handleLibroChange('autor', e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="ISBN"
              value={libroForm.isbn}
              onChange={(e) => handleLibroChange('isbn', e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Agregar Libro'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {libros.map((libro) => (
                  <tr key={libro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{libro.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{libro.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{libro.autor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{libro.isbn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        libro.estado === 'disponible' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {libro.estado || 'disponible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Vista Socios
  const SociosView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => setCurrentView('home')} className="hover:bg-green-700 p-2 rounded">
            <ArrowLeft />
          </button>
          <h1 className="text-3xl font-bold">Gestión de Socios</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="text-green-600" />
            Registrar Nuevo Socio
          </h2>
          <form onSubmit={handleCrearSocio} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={socioForm.nombre}
              onChange={(e) => handleSocioChange('nombre', e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Número de socio"
              value={socioForm.numero_socio}
              onChange={(e) => handleSocioChange('numero_socio', e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Registrar Socio'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Número de Socio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {socios.map((socio) => (
                  <tr key={socio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{socio.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{socio.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{socio.numero_socio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Vista Préstamos
  const PrestamosView = () => {
    const librosDisponibles = libros.filter(l => l.estado !== 'prestado');
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-purple-600 text-white p-6 shadow-lg">
          <div className="container mx-auto flex items-center gap-4">
            <button onClick={() => setCurrentView('home')} className="hover:bg-purple-700 p-2 rounded">
              <ArrowLeft />
            </button>
            <h1 className="text-3xl font-bold">Gestión de Préstamos</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Formulario nuevo préstamo */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-purple-600" />
              Registrar Nuevo Préstamo
            </h2>
            <form onSubmit={handleCrearPrestamo} className="grid md:grid-cols-3 gap-4">
              <select
                value={prestamoForm.socio_id}
                onChange={(e) => handlePrestamoChange('socio_id', e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">Seleccionar socio</option>
                {socios.map((socio) => (
                  <option key={socio.id} value={socio.id}>
                    {socio.nombre} (#{socio.numero_socio})
                  </option>
                ))}
              </select>
              <select
                value={prestamoForm.libro_id}
                onChange={(e) => handlePrestamoChange('libro_id', e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">Seleccionar libro</option>
                {librosDisponibles.map((libro) => (
                  <option key={libro.id} value={libro.id}>
                    {libro.titulo} - {libro.autor}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={prestamoForm.fecha_inicio}
                onChange={(e) => handlePrestamoChange('fecha_inicio', e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : 'Registrar Préstamo'}
              </button>
            </form>
          </div>

          {/* Préstamos activos */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Préstamos Activos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Socio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Libro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Autor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha Préstamo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prestamosActivos.map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prestamo.socio} (#{prestamo.numero_socio})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prestamo.libro}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {prestamo.autor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(prestamo.fecha_inicio).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => abrirModalDevolucion(prestamo)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          Registrar Devolución
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {prestamosActivos.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay préstamos activos</p>
              )}
            </div>
          </div>

          {/* Multas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Multas Registradas</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Socio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Libro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {multas.map((multa) => (
                    <tr key={multa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{multa.socio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{multa.libro}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">${multa.monto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{multa.motivo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(multa.fecha).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {multas.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay multas registradas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Modal de devolución */}
      {showDevolucionModal && prestamoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Registrar Devolución</h3>
              <button
                onClick={() => setShowDevolucionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Socio: <span className="font-semibold">{prestamoSeleccionado.socio}</span></p>
              <p className="text-sm text-gray-600">Libro: <span className="font-semibold">{prestamoSeleccionado.libro}</span></p>
              <p className="text-sm text-gray-600">Fecha préstamo: <span className="font-semibold">{new Date(prestamoSeleccionado.fecha_inicio).toLocaleDateString()}</span></p>
            </div>

            <form onSubmit={handleDevolucion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿El libro está dañado?
                </label>
                <select
                  name="libro_danado"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  defaultValue="false"
                  onChange={(e) => {
                    const isDanado = e.target.value === 'true';
                    document.getElementById('multa-section').style.display = isDanado ? 'block' : 'none';
                  }}
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>

              <div id="multa-section" style={{ display: 'none' }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto de la multa
                  </label>
                  <input
                    type="number"
                    name="monto_multa"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la multa
                  </label>
                  <textarea
                    name="motivo"
                    rows="3"
                    placeholder="Descripción del daño..."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDevolucionModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
                >
                  {loading ? 'Registrando...' : 'Registrar Devolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {currentView === 'home' && <HomeView />}
      {currentView === 'libros' && <LibrosView />}
      {currentView === 'socios' && <SociosView />}
      {currentView === 'prestamos' && <PrestamosView />}
    </>
  );
}

export default App;