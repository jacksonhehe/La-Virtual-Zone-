import PageHeader from '../components/common/PageHeader';
import { ShieldCheck, Lock, AlertTriangle, Mail, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div>
      <PageHeader
        title="Política de Privacidad"
        subtitle="Información sobre cómo recopilamos, usamos y protegemos tus datos personales en La Virtual Zone."
        image="https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwcHJpdmFjeSUyMGRhdGElMjBkYXJrJTIwdGhlbWV8ZW58MHx8fHwxNzQ3MDcxMTgw&w=1000&q=80"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Información general */}
          <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Lock size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Información Importante</h2>
                <p className="text-gray-300 text-sm">
                  Última actualización: 14 de noviembre de 2025
                </p>
                <p className="text-gray-300 mt-2">
                  Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tus datos personales.
                </p>
              </div>
            </div>
          </div>

          {/* Contenido de privacidad */}
          <div className="bg-dark-light rounded-lg border border-gray-800 p-8">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-3xl font-bold text-center mb-8">POLÍTICA DE PRIVACIDAD DE "LA VIRTUAL ZONE"</h1>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">1. Información del responsable del tratamiento</h2>
              <div className="bg-dark rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <p className="text-gray-300"><strong>Responsable del tratamiento:</strong> LVZ GAMING E.I.R.L.</p>
                  <p className="text-gray-300"><strong>RUC:</strong> 20601234567</p>
                  <p className="text-gray-300"><strong>Domicilio:</strong> Av. Gamer N.º 123, distrito de Jesús María, Lima, Perú</p>
                  <p className="text-gray-300"><strong>Correo de contacto general:</strong> soporte@lavirtualzone.com</p>
                  <p className="text-gray-300"><strong>Correo para temas de datos personales:</strong> privacidad@lavirtualzone.com</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                La presente Política de Privacidad (en adelante, la "Política") tiene por finalidad informar de manera clara y transparente cómo se recopilan, utilizan, almacenan y protegen los datos personales de los usuarios (en adelante, el "Usuario" o los "Usuarios").
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">2. Ámbito de aplicación</h2>
              <p className="text-gray-300 mb-4">
                2.1. La presente Política se aplica a los datos personales recopilados a través de:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>El sitio web oficial de La Virtual Zone.</li>
                <li>Cualquier subdominio o sección asociada a LVZ.</li>
                <li>Formularios de registro, contacto, soporte, participación en torneos y funcionalidades vinculadas a la Plataforma.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                2.2. El uso de la Plataforma implica que el Usuario ha leído y acepta esta Política, así como los Términos de Servicio de LVZ.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">3. Datos personales que se recopilan</h2>
              <p className="text-gray-300 mb-4">
                Dependiendo de la forma en que el Usuario interactúe con la Plataforma, se podrán recopilar las siguientes categorías de datos:
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">3.1. Datos de identificación y contacto</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Nombre de usuario (nickname o ID gamer).</li>
                <li>Correo electrónico.</li>
                <li>Contraseña (almacenada de forma cifrada).</li>
                <li>Opcionalmente, nombre y apellido, país, ciudad.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">3.2. Datos de perfil dentro de LVZ</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Club o clubes asociados en la Liga Master.</li>
                <li>Rol en la Plataforma (por ejemplo, Usuario, Director Técnico, Administrador, etc.).</li>
                <li>Estadísticas de juego, rankings, logros, historial de torneos.</li>
                <li>Imagen de perfil o avatar (si el Usuario la proporciona).</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">3.3. Datos de uso y navegación</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Dirección IP.</li>
                <li>Tipo de dispositivo y navegador.</li>
                <li>Páginas visitadas, tiempo de permanencia y acciones realizadas dentro de la Plataforma.</li>
                <li>Logs de acceso y actividad (inicio de sesión, cambios de contraseña, etc.).</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">3.4. Datos de comunicaciones</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Contenido de mensajes enviados al soporte o a través de formularios de contacto.</li>
                <li>Comentarios, reportes de incidencias, sugerencias u otras comunicaciones remitidas por el Usuario.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">3.5. Datos de pagos (solo si se habilitan servicios de pago)</h3>
              <p className="text-gray-300 mb-4">
                En caso de incorporarse servicios de pago (por ejemplo, suscripciones, pases premium, donaciones u otros), se podrán recopilar:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Información parcial sobre transacciones (monto, moneda, fecha, identificador de transacción).</li>
                <li>Los datos de tarjeta u otros medios de pago serán gestionados directamente por el proveedor de pagos externo, no por LVZ, y se regirán por la política de privacidad de dicho proveedor.</li>
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">4. Finalidades del tratamiento</h2>
              <p className="text-gray-300 mb-4">
                Los datos personales del Usuario serán tratados para las siguientes finalidades:
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">4.1. Gestión de la cuenta de Usuario</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Crear, habilitar, administrar y mantener la cuenta de Usuario en la Plataforma.</li>
                <li>Permitir el acceso a las distintas secciones (Liga Master, torneos, panel de usuario, etc.).</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">4.2. Prestación y mejora de los servicios de LVZ</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Gestionar la participación en ligas, torneos, mercado de fichajes y demás funcionalidades.</li>
                <li>Mostrar estadísticas, rankings, resultados y datos relacionados con la actividad del Usuario.</li>
                <li>Mejorar la experiencia de juego y la usabilidad de la Plataforma.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">4.3. Comunicaciones con el Usuario</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Responder consultas, solicitudes de soporte y reclamos.</li>
                <li>Enviar avisos sobre cambios en la Plataforma, actualizaciones importantes de la Política o de los Términos de Servicio.</li>
                <li>Enviar alertas relacionadas con la seguridad de la cuenta (por ejemplo, restablecimiento de contraseña).</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">4.4. Comunicaciones comerciales (opcional)</h3>
              <p className="text-gray-300 mb-4">
                Con el consentimiento del Usuario, LVZ podrá:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Enviar información sobre novedades, eventos, promociones, torneos especiales o contenidos relacionados con la Plataforma.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                El Usuario puede cancelar estas comunicaciones en cualquier momento siguiendo las instrucciones de cada mensaje o escribiendo a <strong>privacidad@lavirtualzone.com</strong>.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">4.5. Seguridad y prevención de fraudes</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Detectar y prevenir actividades fraudulentas, usos abusivos o contrarios a los Términos de Servicio.</li>
                <li>Proteger la integridad de la Plataforma, de otros Usuarios y del propio Titular.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">4.6. Estadísticas y análisis</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Realizar análisis estadísticos, métricas de uso y segmentación de usuarios de forma agregada y anónima, con el fin de mejorar la Plataforma.</li>
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">5. Legitimación del tratamiento</h2>
              <p className="text-gray-300 mb-4">
                LVZ tratará los datos personales del Usuario sobre la base de las siguientes legitimaciones:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li><strong>Ejecución de la relación contractual:</strong> para la creación y gestión de la cuenta del Usuario y el uso de la Plataforma.</li>
                <li><strong>Cumplimiento de obligaciones legales:</strong> cuando las leyes aplicables exijan conservar determinados datos o colaborar con autoridades competentes.</li>
                <li><strong>Interés legítimo del Titular:</strong> para garantizar la seguridad de la Plataforma, mejorar los servicios y realizar estadísticas agregadas.</li>
                <li><strong>Consentimiento del Usuario:</strong> especialmente para el envío de comunicaciones comerciales o el tratamiento de ciertos datos opcionales de perfil.</li>
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">6. Plazo de conservación de los datos</h2>
              <p className="text-gray-300 mb-4">
                Los datos personales se conservarán durante los siguientes periodos:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li><strong>Cuenta activa:</strong> mientras el Usuario tenga una cuenta activa y haga uso de la Plataforma.</li>
                <li><strong>Tras el cierre de la cuenta:</strong> se podrán conservar los datos durante el tiempo necesario para:</li>
              </ul>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-12">
                <li>Atender posibles reclamaciones.</li>
                <li>Cumplir obligaciones legales de conservación (por ejemplo, plazos tributarios o de responsabilidad).</li>
              </ul>
              <p className="text-gray-300 mb-4">
                Una vez transcurridos los plazos de conservación, los datos serán eliminados o anonimizados de manera segura.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">7. Destinatarios de los datos y encargados de tratamiento</h2>
              <p className="text-gray-300 mb-4">
                7.1. Con carácter general, LVZ no vende ni cede datos personales de los Usuarios a terceros con fines comerciales.
              </p>
              <p className="text-gray-300 mb-4">
                7.2. No obstante, los datos podrán ser comunicados a:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li><strong>Proveedores de servicios tecnológicos,</strong> que actúan como encargados de tratamiento, tales como:</li>
              </ul>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-12">
                <li>Servicios de alojamiento web (hosting).</li>
                <li>Proveedores de correo electrónico y envío masivo de notificaciones.</li>
                <li>Herramientas de análisis de tráfico web.</li>
              </ul>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li><strong>Proveedores de servicios de pago,</strong> cuando el Usuario realice transacciones en la Plataforma (los datos de la tarjeta se tratan directamente por el proveedor de pagos).</li>
                <li><strong>Autoridades administrativas o judiciales,</strong> cuando exista una obligación legal de facilitar información o en el marco de un proceso legal.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                7.3. En todos los casos, LVZ procurará que los encargados de tratamiento ofrezcan garantías adecuadas de seguridad y confidencialidad.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">8. Transferencias internacionales de datos</h2>
              <p className="text-gray-300 mb-4">
                En caso de que algunos de los proveedores de servicios se encuentren fuera del Perú, o en países que no ofrezcan un nivel de protección equivalente, LVZ adoptará las medidas necesarias para garantizar un nivel adecuado de protección de los datos personales, de acuerdo con la normativa aplicable (por ejemplo, mediante cláusulas contractuales apropiadas).
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">9. Derechos de los Usuarios sobre sus datos</h2>
              <p className="text-gray-300 mb-4">
                El Usuario puede ejercer, en los términos previstos por la normativa aplicable, los siguientes derechos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Acceso</h4>
                  <p className="text-gray-300 text-sm">Obtener información sobre los datos personales que LVZ trata.</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Rectificación</h4>
                  <p className="text-gray-300 text-sm">Solicitar la corrección de datos inexactos o incompletos.</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Cancelación/Supresión</h4>
                  <p className="text-gray-300 text-sm">Solicitar la eliminación de sus datos cuando ya no sean necesarios.</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Oposición</h4>
                  <p className="text-gray-300 text-sm">Oponerse al tratamiento de sus datos en determinados supuestos.</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Limitación</h4>
                  <p className="text-gray-300 text-sm">Solicitar que se limite el uso de sus datos en ciertos casos.</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Portabilidad</h4>
                  <p className="text-gray-300 text-sm">Recibir sus datos en un formato estructurado y de uso común.</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                <strong>Revocación del consentimiento:</strong> Retirar el consentimiento otorgado para una o varias finalidades específicas, sin efecto retroactivo.
              </p>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-primary mb-2 flex items-center">
                  <Mail size={16} className="mr-2" />
                  Para ejercer estos derechos, envía una solicitud a:
                </h4>
                <p className="text-gray-300"><strong>Correo electrónico:</strong> privacidad@lavirtualzone.com</p>
                <p className="text-gray-300 text-sm mt-1">Asunto sugerido: "Ejercicio de derechos de protección de datos – LVZ"</p>
                <p className="text-gray-300 text-sm mt-2">La solicitud debe incluir: nombre de usuario o correo registrado, descripción del derecho que desea ejercer y documentación que acredite su identidad.</p>
              </div>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">10. Privacidad de menores de edad</h2>
              <p className="text-gray-300 mb-4">
                10.1. La Plataforma está dirigida a personas mayores de 13 años.
              </p>
              <p className="text-gray-300 mb-4">
                10.2. Si el Usuario es menor de 18 años, declara contar con la autorización de sus padres, tutores o representantes legales para utilizar la Plataforma y proporcionar sus datos personales.
              </p>
              <p className="text-gray-300 mb-4">
                10.3. Si LVZ detecta que se han recopilado datos de un menor sin el consentimiento correspondiente, podrá proceder a la eliminación de la cuenta o a solicitar la acreditación de dicho consentimiento.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">11. Medidas de seguridad</h2>
              <p className="text-gray-300 mb-4">
                LVZ adopta medidas técnicas y organizativas razonables para proteger los datos personales frente a accesos no autorizados, pérdida, alteración o divulgación no autorizada, tales como:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Cifrado de contraseñas.</li>
                <li>Control de accesos internos.</li>
                <li>Copias de seguridad.</li>
                <li>Uso de protocolos seguros (por ejemplo, HTTPS) cuando la infraestructura lo permita.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                No obstante, ningún sistema es completamente seguro y el Usuario reconoce que pueden existir riesgos derivados del uso de servicios en línea.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">12. Uso de cookies y tecnologías similares</h2>
              <p className="text-gray-300 mb-4">
                La Plataforma puede utilizar cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Recordar las preferencias del Usuario.</li>
                <li>Facilitar el inicio de sesión y la navegación.</li>
                <li>Obtener estadísticas de uso y rendimiento.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                La información detallada sobre el uso de cookies, tipos, finalidad y configuración se describirá en la Política de Cookies específica, la cual complementa la presente Política de Privacidad.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">13. Enlaces a sitios de terceros</h2>
              <p className="text-gray-300 mb-4">
                La Plataforma puede incluir enlaces a páginas web o servicios de terceros. LVZ no se hace responsable de las políticas de privacidad, seguridad o contenidos de dichos sitios externos. El Usuario debe revisar las políticas de cada sitio que visite.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">14. Actualizaciones de la Política de Privacidad</h2>
              <p className="text-gray-300 mb-4">
                LVZ podrá modificar la presente Política para adaptarla a cambios normativos, tecnológicos o de funcionamiento de la Plataforma.
              </p>
              <p className="text-gray-300 mb-4">
                Las versiones actualizadas se publicarán en la Plataforma, indicando la fecha de la última actualización. El uso continuado de la Plataforma después de la publicación de una nueva versión implicará la aceptación de dicha versión.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">15. Contacto</h2>
              <p className="text-gray-300 mb-4">
                Para cualquier duda o consulta relacionada con esta Política de Privacidad o con el tratamiento de sus datos personales, el Usuario puede contactar a:
              </p>
              <div className="bg-dark rounded-lg p-4 mt-4">
                <p className="text-gray-300">
                  <strong>Correo electrónico:</strong> privacidad@lavirtualzone.com
                </p>
                <p className="text-gray-300 mt-2">
                  <strong>Correo de soporte general:</strong> soporte@lavirtualzone.com
                </p>
              </div>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ShieldCheck size={24} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-500 mb-2">Compromiso con tu privacidad</h3>
                <p className="text-gray-300 text-sm">
                  En La Virtual Zone nos comprometemos a proteger tus datos personales y a ser transparentes sobre cómo los utilizamos.
                  Si tienes alguna pregunta sobre esta política, no dudes en contactarnos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
