import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Link } from 'react-router-dom';
import { Mail, ChevronDown, ChevronUp, AlertCircle, Calendar, ShoppingBag, Trophy, FileText, Info } from 'lucide-react';

const Help = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');
  
  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };
  
  return (
    <div>
      <PageHeader 
        title="Ayuda y Soporte" 
        subtitle="Encuentra respuestas a preguntas frecuentes y obtén asistencia sobre La Virtual Zone."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden sticky top-24">
              <div className="p-4 bg-dark-lighter border-b border-gray-800">
                <h3 className="font-bold">Categorías</h3>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={() => setActiveSection('account')}
                  className={`w-full text-left p-2 rounded-md ${activeSection === 'account' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Cuenta y Registro
                </button>
                <button 
                  onClick={() => setActiveSection('tournaments')}
                  className={`w-full text-left p-2 rounded-md ${activeSection === 'tournaments' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Participación en Torneos
                </button>
                <button 
                  onClick={() => setActiveSection('league')}
                  className={`w-full text-left p-2 rounded-md ${activeSection === 'league' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Liga Master
                </button>
                <button 
                  onClick={() => setActiveSection('transfers')}
                  className={`w-full text-left p-2 rounded-md ${activeSection === 'transfers' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Fichajes y Mercado
                </button>
                <button 
                  onClick={() => setActiveSection('content')}
                  className={`w-full text-left p-2 rounded-md ${activeSection === 'content' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Subida de Contenido
                </button>
                <button 
                  onClick={() => setActiveSection('rules')}
                  className={`w-full text-left p-2 rounded-md ${activeSection === 'rules' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Reglas y Sanciones
                </button>
              </div>
              
              <div className="p-4 bg-dark-lighter border-t border-gray-800 mt-4">
                <h3 className="font-bold flex items-center mb-2">
                  <AlertCircle size={16} className="text-primary mr-2" />
                  Estado del sistema
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mercado</span>
                    <span className="flex items-center text-green-500">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      Abierto
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Inscripciones</span>
                    <span className="flex items-center text-yellow-500">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                      En curso
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-6">
                {activeSection === 'account' && 'Cuenta y Registro'}
                {activeSection === 'tournaments' && 'Participación en Torneos'}
                {activeSection === 'league' && 'Liga Master'}
                {activeSection === 'transfers' && 'Fichajes y Mercado'}
                {activeSection === 'content' && 'Subida de Contenido'}
                {activeSection === 'rules' && 'Reglas y Sanciones'}
              </h2>
              
              <div className="space-y-4">
                {activeSection === 'account' && (
                  <>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('faq-1')}
                      >
                        <span className="font-medium">¿Cómo me registro?</span>
                        {openFaq === 'faq-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'faq-1' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Para registrarte en La Virtual Zone, sigue estos pasos:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Haz clic en el botón "Registrarse" en la parte superior derecha del sitio.</li>
                            <li>Completa el formulario con tu nombre de usuario, correo electrónico y contraseña.</li>
                            <li>Acepta los términos y condiciones.</li>
                            <li>Haz clic en "Crear cuenta".</li>
                            <li>¡Listo! Ya puedes acceder a tu cuenta y comenzar a participar.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('faq-2')}
                      >
                        <span className="font-medium">¿Cómo recupero mi contraseña?</span>
                        {openFaq === 'faq-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'faq-2' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Si olvidaste tu contraseña, puedes recuperarla siguiendo estos pasos:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Haz clic en "Iniciar sesión" en la parte superior derecha.</li>
                            <li>Selecciona la opción "¿Olvidaste tu contraseña?".</li>
                            <li>Ingresa el correo electrónico asociado a tu cuenta.</li>
                            <li>Recibirás un correo con instrucciones para restablecer tu contraseña.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('faq-3')}
                      >
                        <span className="font-medium">¿Cómo cambio mi avatar o información de perfil?</span>
                        {openFaq === 'faq-3' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'faq-3' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Para actualizar tu información de perfil:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Inicia sesión en tu cuenta.</li>
                            <li>Haz clic en tu avatar o nombre de usuario en la parte superior derecha.</li>
                            <li>Selecciona "Mi Perfil" o accede a "/usuario".</li>
                            <li>En la sección "Mi Perfil" podrás editar tu avatar, correo electrónico y otros datos personales.</li>
                            <li>Guarda los cambios.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {activeSection === 'tournaments' && (
                  <>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('tournament-1')}
                      >
                        <span className="font-medium">¿Cómo puedo participar en un torneo?</span>
                        {openFaq === 'tournament-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'tournament-1' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Para participar en torneos de La Virtual Zone:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Inicia sesión en tu cuenta.</li>
                            <li>Ve a la sección "Torneos" en el menú principal.</li>
                            <li>Busca torneos con estado "Inscripciones abiertas".</li>
                            <li>Haz clic en "Ver detalles" del torneo que te interese.</li>
                            <li>Dentro de la página del torneo, haz clic en "Solicitar participación".</li>
                            <li>Completa el formulario de inscripción.</li>
                            <li>Tu solicitud será revisada y recibirás confirmación.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('tournament-2')}
                      >
                        <span className="font-medium">¿Qué formatos de torneos existen?</span>
                        {openFaq === 'tournament-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'tournament-2' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            La Virtual Zone ofrece varios formatos de torneos:
                          </p>
                          <ul className="mt-2 space-y-2 text-gray-300">
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 flex-shrink-0 text-xs">L</span>
                              <span><strong>Liga:</strong> Todos los equipos se enfrentan entre sí en formato de liga, con partidos de ida y vuelta. Gana quien consiga más puntos.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-2 flex-shrink-0 text-xs">C</span>
                              <span><strong>Copa:</strong> Torneo eliminatorio directo. Los equipos se enfrentan en cruces a partido único o ida y vuelta. El perdedor queda eliminado.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center mr-2 flex-shrink-0 text-xs">G</span>
                              <span><strong>Grupos + Eliminatorias:</strong> Fase inicial de grupos y luego una fase eliminatoria con los mejores de cada grupo.</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {activeSection === 'league' && (
                  <>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('league-1')}
                      >
                        <span className="font-medium">¿Qué es la Liga Master?</span>
                        {openFaq === 'league-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'league-1' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            La Liga Master es la competición principal de La Virtual Zone. Es una liga cerrada con hasta 40 clubes ficticios, donde cada equipo es administrado por un usuario con rol de DT (Director Técnico).
                          </p>
                          <p className="mt-2 text-gray-300">
                            Características principales:
                          </p>
                          <ul className="mt-2 space-y-2 text-gray-300 list-disc list-inside">
                            <li>Cada DT gestiona un club ficticio completo.</li>
                            <li>Incluye sistema de fichajes, finanzas, tácticas y plantilla.</li>
                            <li>Competición en formato liga, todos contra todos.</li>
                            <li>Temporadas regulares con ascensos y descensos.</li>
                            <li>Premios y reconocimientos para los mejores equipos y jugadores.</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('league-2')}
                      >
                        <span className="font-medium">¿Cómo unirme a la Liga Master?</span>
                        {openFaq === 'league-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'league-2' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Para unirte a la Liga Master:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Inicia sesión en tu cuenta.</li>
                            <li>Accede a tu panel de usuario ("/usuario").</li>
                            <li>Busca la opción "Solicitar ingreso a Liga Master".</li>
                            <li>Completa el formulario de solicitud.</li>
                            <li>Si hay cupos disponibles, se te asignará un club.</li>
                            <li>Si no hay cupos, entrarás en lista de espera.</li>
                          </ol>
                          <p className="mt-2 text-gray-300">
                            Nota: Para la Liga Master necesitas tener experiencia previa en la plataforma o demostrar compromiso. Se da prioridad a usuarios activos.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {activeSection === 'transfers' && (
                  <>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('transfer-1')}
                      >
                        <span className="font-medium">¿Cómo funciona el mercado de fichajes?</span>
                        {openFaq === 'transfer-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'transfer-1' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            El mercado de fichajes es el sistema por el cual los clubes compran y venden jugadores:
                          </p>
                          <ul className="mt-2 space-y-2 text-gray-300 list-disc list-inside">
                            <li>El mercado abre en períodos específicos de la temporada.</li>
                            <li>Cada club tiene un presupuesto limitado para fichajes.</li>
                            <li>Los DTs pueden poner a sus jugadores a la venta o hacer ofertas por jugadores de otros equipos.</li>
                            <li>Las transferencias se negocian directamente entre clubes.</li>
                            <li>Toda transferencia debe respetar el presupuesto del club.</li>
                          </ul>
                          <p className="mt-2 text-gray-300">
                            Para acceder al mercado, abre el Tablero de DT y selecciona la pestaña "Mercado".
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('transfer-2')}
                      >
                        <span className="font-medium">¿Cómo hago una oferta por un jugador?</span>
                        {openFaq === 'transfer-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'transfer-2' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Para hacer una oferta por un jugador:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Abre el Tablero de DT y ve a la pestaña "Mercado".</li>
                            <li>Busca el jugador que te interesa usando los filtros disponibles.</li>
                            <li>Haz clic en "Ofertar" junto al jugador.</li>
                            <li>Introduce la cantidad que ofreces (debe estar dentro de tu presupuesto).</li>
                            <li>Confirma la oferta.</li>
                            <li>Espera la respuesta del club propietario del jugador.</li>
                          </ol>
                          <p className="mt-2 text-gray-300">
                            Si la oferta es aceptada, el jugador pasará a formar parte de tu plantilla y el monto se deducirá de tu presupuesto.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {activeSection === 'content' && (
                  <>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('content-1')}
                      >
                        <span className="font-medium">¿Cómo subo contenido a la galería?</span>
                        {openFaq === 'content-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'content-1' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Para subir contenido a la galería:
                          </p>
                          <ol className="mt-2 space-y-2 text-gray-300 list-decimal list-inside">
                            <li>Inicia sesión en tu cuenta.</li>
                            <li>Ve a la sección "Galería".</li>
                            <li>Haz clic en el botón "Subir" en la parte superior.</li>
                            <li>Selecciona el tipo de contenido: Imagen o Video.</li>
                            <li>Sube tu archivo (formatos permitidos: JPG, PNG, GIF para imágenes; MP4, WebM para videos).</li>
                            <li>Añade un título, descripción y categoría.</li>
                            <li>Haz clic en "Publicar".</li>
                          </ol>
                          <p className="mt-2 text-gray-300">
                            Todo contenido subido es moderado antes de ser publicado. Asegúrate de seguir las normas de la comunidad.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('content-2')}
                      >
                        <span className="font-medium">¿Qué tipo de contenido puedo subir?</span>
                        {openFaq === 'content-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'content-2' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Puedes subir diversos tipos de contenido relacionado con La Virtual Zone:
                          </p>
                          <ul className="mt-2 space-y-2 text-gray-300">
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 flex-shrink-0 text-xs">I</span>
                              <span><strong>Imágenes:</strong> Capturas de partidos, escudos de equipos, uniformes, momentos destacados, etc.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-2 flex-shrink-0 text-xs">V</span>
                              <span><strong>Videos:</strong> Clips de jugadas, goles destacados, resúmenes de partidos (máximo 2 minutos).</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center mr-2 flex-shrink-0 text-xs">A</span>
                              <span><strong>Afiches:</strong> Posters promocionales de torneos, eventos o clubes.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-neon-red/20 text-neon-red flex items-center justify-center mr-2 flex-shrink-0 text-xs">M</span>
                              <span><strong>Memes:</strong> Contenido humorístico relacionado con la comunidad (siguiendo las normas).</span>
                            </li>
                          </ul>
                          <p className="mt-2 text-gray-300">
                            Todo el contenido debe estar relacionado con La Virtual Zone y respetar las normas de la comunidad.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {activeSection === 'rules' && (
                  <>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('rules-1')}
                      >
                        <span className="font-medium">¿Cuáles son las reglas generales de la plataforma?</span>
                        {openFaq === 'rules-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'rules-1' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            Reglas generales de La Virtual Zone:
                          </p>
                          <ul className="mt-2 space-y-2 text-gray-300 list-disc list-inside">
                            <li>Respeto a todos los miembros de la comunidad.</li>
                            <li>Está prohibido el lenguaje ofensivo, discriminatorio o insultante.</li>
                            <li>No se permite hacer spam o publicidad no autorizada.</li>
                            <li>Está prohibido el uso de trampas o exploits en los torneos.</li>
                            <li>Los usuarios deben cumplir con sus compromisos en torneos y Liga Master.</li>
                            <li>Respetar la propiedad intelectual y no compartir contenido sin permiso.</li>
                            <li>La suplantación de identidad está prohibida.</li>
                            <li>Está prohibido el uso de múltiples cuentas para obtener ventajas.</li>
                          </ul>
                          <p className="mt-2 text-gray-300">
                            El incumplimiento de estas reglas puede resultar en sanciones temporales o permanentes.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 bg-dark-lighter text-left"
                        onClick={() => toggleFaq('rules-2')}
                      >
                        <span className="font-medium">¿Qué tipos de sanciones existen?</span>
                        {openFaq === 'rules-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {openFaq === 'rules-2' && (
                        <div className="p-4 bg-dark">
                          <p className="text-gray-300">
                            La Virtual Zone puede aplicar diferentes sanciones según la gravedad de la infracción:
                          </p>
                          <ul className="mt-2 space-y-2 text-gray-300">
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mr-2 flex-shrink-0 text-xs">L</span>
                              <span><strong>Advertencia:</strong> Aviso formal por infracciones menores, sin consecuencias inmediatas.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mr-2 flex-shrink-0 text-xs">M</span>
                              <span><strong>Suspensión temporal:</strong> Restricción de acceso a ciertas funcionalidades por un período limitado (1-30 días).</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mr-2 flex-shrink-0 text-xs">G</span>
                              <span><strong>Expulsión de torneo:</strong> Eliminación de un torneo o competición específica.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-red-700/20 text-red-700 flex items-center justify-center mr-2 flex-shrink-0 text-xs">S</span>
                              <span><strong>Suspensión de cuenta:</strong> Restricción total del acceso a la plataforma por un período prolongado.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-gray-500/20 text-gray-500 flex items-center justify-center mr-2 flex-shrink-0 text-xs">B</span>
                              <span><strong>Baneo permanente:</strong> Expulsión definitiva de la plataforma para infracciones muy graves o reincidentes.</span>
                            </li>
                          </ul>
                          <p className="mt-2 text-gray-300">
                            Las sanciones son aplicadas por el equipo de administración tras evaluar cada caso.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mt-8">
              <h2 className="text-2xl font-bold mb-6">Contacto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-dark rounded-lg p-6">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Mail size={18} className="text-primary mr-2" />
                    Formulario de contacto
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Si no encuentras respuesta a tu pregunta, puedes enviarnos un mensaje y te responderemos lo antes posible.
                  </p>
                  <form>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                      <input type="text" className="input w-full" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Correo electrónico</label>
                      <input type="email" className="input w-full" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Asunto</label>
                      <input type="text" className="input w-full" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-1">Mensaje</label>
                      <textarea className="input w-full min-h-[100px]"></textarea>
                    </div>
                    <button type="submit" className="btn-primary w-full">
                      Enviar solicitud
                    </button>
                  </form>
                </div>
                
                <div>
                  <div className="bg-dark rounded-lg p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center">
                      <Info size={18} className="text-primary mr-2" />
                      Información de contacto
                    </h3>
                    <p className="text-gray-300 mb-4">
                      También puedes contactarnos directamente a través de:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail size={16} className="text-primary mr-3" />
                        <span>contacto@virtualzone.com</span>
                      </div>
                      <div className="flex items-center">
                        <Trophy size={16} className="text-primary mr-3" />
                        <span>Discord: VirtualZone#1234</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark rounded-lg p-6">
                    <h3 className="font-bold mb-4">Enlaces útiles</h3>
                    <div className="space-y-2">
                      <Link to="/terminos" className="flex items-center text-primary hover:text-primary-light">
                        <FileText size={16} className="mr-2" />
                        <span>Reglamento general</span>
                      </Link>
                      <Link to="/liga-master" className="flex items-center text-primary hover:text-primary-light">
                        <Trophy size={16} className="mr-2" />
                        <span>Reglamento Liga Master</span>
                      </Link>
                      <Link to="/liga-master/calendario" className="flex items-center text-primary hover:text-primary-light">
                        <Calendar size={16} className="mr-2" />
                        <span>Calendario de eventos</span>
                      </Link>
                      <Link to="/tienda" className="flex items-center text-primary hover:text-primary-light">
                        <ShoppingBag size={16} className="mr-2" />
                        <span>Guía de la tienda</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
 