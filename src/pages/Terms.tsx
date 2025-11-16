import PageHeader from '../components/common/PageHeader';
import { FileText, Shield, AlertTriangle } from 'lucide-react';

const Terms = () => {
  return (
    <div>
      <PageHeader
        title="Términos y Condiciones"
        subtitle="Lee atentamente los términos de servicio de La Virtual Zone antes de usar la plataforma."
        image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxsZWdhbCUyMGRvY3VtZW50JTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Información general */}
          <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Información Importante</h2>
                <p className="text-gray-300 text-sm">
                  Última actualización: 14 de noviembre de 2025
                </p>
                <p className="text-gray-300 mt-2">
                  Al acceder o utilizar La Virtual Zone, aceptas estos términos íntegramente.
                  Si no estás de acuerdo, por favor abstente de usar la plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Contenido de términos */}
          <div className="bg-dark-light rounded-lg border border-gray-800 p-8">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-3xl font-bold text-center mb-8">TÉRMINOS DE SERVICIO DE "LA VIRTUAL ZONE"</h1>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">1. Información general</h2>
              <p className="text-gray-300 mb-4">
                1.1. Los presentes Términos de Servicio (en adelante, los "Términos") regulan el acceso y uso de la plataforma web denominada "La Virtual Zone" o "LVZ" (en adelante, la "Plataforma"), dedicada a la organización, gestión y simulación de ligas, torneos y modos de juego ficticios del videojuego PES 2021 Season Update y otros videojuegos de fútbol y eSports.
              </p>
              <p className="text-gray-300 mb-4">
                1.2. La Plataforma es administrada por LVZ GAMING E.I.R.L., identificada con RUC N.º 20601234567, con domicilio en Av. Gamer N.º 123, distrito de Jesús María, Lima, Perú, correo de contacto soporte@lavirtualzone.com (en adelante, el "Titular").
              </p>
              <p className="text-gray-300 mb-4">
                1.3. Al acceder o utilizar la Plataforma, el usuario (en adelante, el "Usuario") declara haber leído, comprendido y aceptado íntegramente estos Términos y la Política de Privacidad correspondiente. Si no está de acuerdo, debe abstenerse de usar la Plataforma.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">2. Aceptación de los Términos</h2>
              <p className="text-gray-300 mb-4">
                2.1. El uso de la Plataforma implica la aceptación expresa, libre y voluntaria de estos Términos.
              </p>
              <p className="text-gray-300 mb-4">
                2.2. El Titular podrá modificar los Términos en cualquier momento. Las versiones actualizadas se publicarán en la propia Plataforma, indicando la fecha de la última actualización. El uso continuado de la Plataforma después de realizadas las modificaciones implicará la aceptación de los nuevos Términos.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">3. Edad mínima y capacidad</h2>
              <p className="text-gray-300 mb-4">
                3.1. La Plataforma está dirigida a personas mayores de 13 años.
              </p>
              <p className="text-gray-300 mb-4">
                3.2. Si el Usuario es menor de 18 años, declara contar con la autorización y supervisión de sus padres, tutores o representantes legales para registrarse y utilizar la Plataforma.
              </p>
              <p className="text-gray-300 mb-4">
                3.3. El Titular podrá solicitar en cualquier momento la acreditación de la mayoría de edad o del consentimiento de los padres o tutores. En caso de duda o incumplimiento, podrá suspender o cancelar la cuenta del Usuario.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">4. Registro de cuenta y credenciales</h2>
              <p className="text-gray-300 mb-4">
                4.1. Para acceder a determinadas funciones (torneos, Liga Master, panel de usuario, mercado de fichajes, etc.) es necesario crear una cuenta de Usuario.
              </p>
              <p className="text-gray-300 mb-4">
                4.2. El Usuario se compromete a:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Proporcionar datos veraces, exactos, completos y actualizados.</li>
                <li>No usar identidades falsas ni suplantar a terceros.</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso (usuario y contraseña).</li>
              </ul>
              <p className="text-gray-300 mb-4">
                4.3. El Usuario es exclusivo responsable de todas las actividades realizadas desde su cuenta. Cualquier uso no autorizado deberá ser notificado de inmediato al Titular a través del correo soporte@lavirtualzone.com.
              </p>
              <p className="text-gray-300 mb-4">
                4.4. El Titular podrá suspender o cancelar la cuenta del Usuario si detecta uso indebido, violación de estos Términos, actividad fraudulenta o riesgos para la seguridad de la Plataforma o de otros usuarios.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">5. Descripción del servicio</h2>
              <p className="text-gray-300 mb-4">
                5.1. La Plataforma ofrece, entre otras, las siguientes funcionalidades:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Organización y gestión de ligas y torneos ficticios.</li>
                <li>Modo Liga Master con clubes personalizados, plantillas y mercado de fichajes simulado.</li>
                <li>Perfiles de Usuarios, Directores Técnicos (DT), clubes y jugadores ficticios o inspirados en la realidad.</li>
                <li>Estadísticas, rankings, tablas de posiciones, calendarios y resultados simulados.</li>
                <li>Posibles secciones de blog, noticias, tienda virtual, eventos especiales y otras funcionalidades relacionadas con videojuegos y eSports.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                5.2. Salvo que se indique lo contrario, todas las ligas, clubes, jugadores, monedas virtuales y estadísticas que se gestionan en la Plataforma son ficciones o simulaciones, sin valor real alguno.
              </p>
              <p className="text-gray-300 mb-4">
                5.3. El Titular se reserva el derecho de modificar, suspender o descontinuar parcial o totalmente la Plataforma, o cualquiera de sus secciones, en cualquier momento y sin necesidad de aviso previo.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">6. Monedas virtuales, puntos, recompensas y tienda</h2>
              <p className="text-gray-300 mb-4">
                6.1. La Plataforma puede utilizar monedas virtuales, puntos, créditos o recompensas digitales (en adelante, "Monedas Virtuales") para participar en ciertas actividades, torneos o para adquirir ítems virtuales.
              </p>
              <p className="text-gray-300 mb-4">
                6.2. Las Monedas Virtuales y los ítems virtuales:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>No tienen valor monetario real.</li>
                <li>No son canjeables por dinero ni por bienes o servicios fuera de la Plataforma.</li>
                <li>Pueden ser modificados, reducidos, reiniciados o eliminados por el Titular en cualquier momento, especialmente en caso de actualización del sistema, errores o conducta fraudulenta.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                6.3. Si en algún momento se habilitan pagos con dinero real (por ejemplo, donaciones, pases premium, etc.), se informará de forma clara el precio, medio de pago y condiciones, pudiendo existir Términos específicos adicionales para dichas transacciones.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">7. Normas de conducta del Usuario</h2>
              <p className="text-gray-300 mb-4">
                7.1. El Usuario se compromete a utilizar la Plataforma de manera lícita, respetuosa y responsable, absteniéndose de:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Difundir contenido violento, discriminatorio, racista, sexista, xenófobo, homofóbico, difamatorio, obsceno o ilegal.</li>
                <li>Acosar, amenazar, insultar o vulnerar derechos de otros Usuarios o de terceros.</li>
                <li>Publicar datos personales de terceros sin su consentimiento.</li>
                <li>Usar la Plataforma para actividades fraudulentas, delictivas o contrarias a la legislación vigente.</li>
                <li>Manipular resultados, estadísticas o el mercado de fichajes por medios no permitidos (scripts, exploits, hackeo, etc.).</li>
                <li>Intentar acceder de manera no autorizada a sistemas, bases de datos o cuentas de otros Usuarios.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                7.2. El Titular podrá advertir, suspender o expulsar a cualquier Usuario que incumpla estas normas, pudiendo además eliminar o editar los contenidos que vulneren la ley o los presentes Términos.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">8. Contenidos generados por el Usuario</h2>
              <p className="text-gray-300 mb-4">
                8.1. La Plataforma puede permitir que los Usuarios generen o compartan contenidos (por ejemplo, textos, comentarios, imágenes, escudos, nombres de clubes, perfiles, etc.) (en adelante, "Contenido de Usuario").
              </p>
              <p className="text-gray-300 mb-4">
                8.2. El Usuario declara y garantiza que:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Es titular de los derechos sobre el Contenido de Usuario o cuenta con las licencias y autorizaciones necesarias.</li>
                <li>El Contenido de Usuario no infringe derechos de autor, marcas, derechos de imagen ni otros derechos de terceros.</li>
                <li>El Contenido de Usuario no vulnera la legislación vigente ni estos Términos.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                8.3. Al subir Contenido de Usuario a la Plataforma, el Usuario otorga al Titular una licencia no exclusiva, mundial, gratuita, transferible y sublicenciable para usar, reproducir, modificar, adaptar, publicar y mostrar dicho contenido dentro de la Plataforma y en materiales promocionales relacionados con LVZ.
              </p>
              <p className="text-gray-300 mb-4">
                8.4. El Titular podrá eliminar, modificar o bloquear cualquier Contenido de Usuario que considere inapropiado, ilegal o contrario a los presentes Términos.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">9. Propiedad intelectual</h2>
              <p className="text-gray-300 mb-4">
                9.1. Todos los elementos de la Plataforma (diseño, código, logos propios de LVZ, interfaces, gráficos, textos, bases de datos, etc.) son propiedad del Titular o se utilizan con autorización de sus legítimos titulares, y se encuentran protegidos por las normas de propiedad intelectual e industrial aplicables.
              </p>
              <p className="text-gray-300 mb-4">
                9.2. Está prohibido reproducir, distribuir, modificar, crear obras derivadas, realizar ingeniería inversa o explotar de cualquier forma los contenidos de la Plataforma sin autorización expresa y por escrito del Titular.
              </p>
              <p className="text-gray-300 mb-4">
                9.3. El Usuario podrá utilizar la Plataforma y su contenido únicamente para fines personales y no comerciales, de acuerdo con lo establecido en estos Términos.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">10. Marcas y derechos de terceros (PES, Konami, etc.)</h2>
              <p className="text-gray-300 mb-4">
                10.1. "PES 2021 Season Update", "eFootball" y las demás marcas, nombres de productos y logotipos asociados son propiedad de sus respectivos titulares (por ejemplo, Konami Digital Entertainment y otros).
              </p>
              <p className="text-gray-300 mb-4">
                10.2. La Plataforma no está afiliada, patrocinada ni avalada oficialmente por Konami ni por ninguna desarrolladora de videojuegos, clubes reales, ligas oficiales o federaciones deportivas.
              </p>
              <p className="text-gray-300 mb-4">
                10.3. Cualquier referencia a marcas registradas o nombres reales de clubes, ligas o jugadores se realiza solo con fines descriptivos o de simulación, sin pretender violar derechos de terceros.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">11. Disponibilidad del servicio y exención de responsabilidad</h2>
              <p className="text-gray-300 mb-4">
                11.1. El Titular no garantiza que la Plataforma funcione de forma ininterrumpida, libre de errores o totalmente segura, aunque realizará esfuerzos razonables para mantener su funcionamiento estable.
              </p>
              <p className="text-gray-300 mb-4">
                11.2. La Plataforma se ofrece "tal cual" ("as is"), sin garantías de ningún tipo, expresas o implícitas, incluyendo, sin limitación, garantías de idoneidad para un propósito particular.
              </p>
              <p className="text-gray-300 mb-4">
                11.3. El Titular no será responsable por:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Fallos técnicos, interrupciones, caídas del servidor, errores de software o pérdida de datos.</li>
                <li>Daños directos o indirectos sufridos por el Usuario como consecuencia del uso o imposibilidad de uso de la Plataforma.</li>
                <li>Contenidos o conductas de otros Usuarios.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                11.4. El Usuario utiliza la Plataforma bajo su propia responsabilidad y asume cualquier riesgo derivado del uso de la misma.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">12. Limitación de responsabilidad</h2>
              <p className="text-gray-300 mb-4">
                12.1. En la máxima medida permitida por la legislación aplicable, la responsabilidad total del Titular frente al Usuario por cualquier concepto vinculado al uso de la Plataforma se limitará, en conjunto, al monto efectivamente pagado por el Usuario al Titular (si lo hubiere) durante los últimos tres (3) meses previos al hecho generador del reclamo.
              </p>
              <p className="text-gray-300 mb-4">
                12.2. En ningún caso el Titular será responsable por daños indirectos, incidentales, especiales, punitivos o consecuenciales, incluyendo lucro cesante, pérdida de datos o reputación, aun cuando haya sido advertido de la posibilidad de tales daños.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">13. Suspensión y cierre de cuenta</h2>
              <p className="text-gray-300 mb-4">
                13.1. El Usuario puede solicitar el cierre de su cuenta en cualquier momento, siguiendo las instrucciones disponibles en la Plataforma o escribiendo al correo de soporte soporte@lavirtualzone.com.
              </p>
              <p className="text-gray-300 mb-4">
                13.2. El Titular podrá suspender temporalmente o cancelar de forma definitiva la cuenta del Usuario en caso de:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                <li>Incumplimiento de estos Términos o de la ley.</li>
                <li>Sospecha de fraude o uso malicioso de la Plataforma.</li>
                <li>Riesgos para la seguridad, integridad del sistema o de otros Usuarios.</li>
              </ul>
              <p className="text-gray-300 mb-4">
                13.3. En caso de cancelación de la cuenta, el Usuario podría perder acceso a sus datos, Monedas Virtuales, rankings y cualquier progreso o registro dentro de la Plataforma, sin derecho a compensación.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">14. Protección de datos personales</h2>
              <p className="text-gray-300 mb-4">
                14.1. El tratamiento de los datos personales del Usuario se regirá por la Política de Privacidad de la Plataforma, la cual forma parte integrante de estos Términos.
              </p>
              <p className="text-gray-300 mb-4">
                14.2. El Usuario declara conocer y aceptar la forma en que se recopilan, almacenan y utilizan sus datos personales para el funcionamiento de la Plataforma, en concordancia con la normativa aplicable de protección de datos.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">15. Enlaces a sitios de terceros</h2>
              <p className="text-gray-300 mb-4">
                15.1. La Plataforma puede contener enlaces a páginas web o servicios de terceros. Estos enlaces se proporcionan únicamente para conveniencia del Usuario.
              </p>
              <p className="text-gray-300 mb-4">
                15.2. El Titular no controla ni es responsable del contenido, políticas o prácticas de dichos sitios externos. El acceso a ellos se realiza bajo la exclusiva responsabilidad del Usuario.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">16. Legislación aplicable y jurisdicción</h2>
              <p className="text-gray-300 mb-4">
                16.1. Estos Términos se rigen por las leyes de la República del Perú, sin perjuicio de las normas de derecho internacional privado que pudieran corresponder.
              </p>
              <p className="text-gray-300 mb-4">
                16.2. Para cualquier controversia derivada del uso de la Plataforma, las partes se someten a la jurisdicción de los Juzgados y Salas competentes de la provincia de Lima, Perú, renunciando a cualquier otro fuero que pudiera corresponderles, salvo que la ley disponga un fuero imperativo.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4 text-primary">17. Contacto</h2>
              <p className="text-gray-300 mb-4">
                17.1. Para consultas, reclamos o solicitudes relacionadas con la Plataforma o con estos Términos, el Usuario puede comunicarse a:
              </p>
              <div className="bg-dark rounded-lg p-4 mt-4">
                <p className="text-gray-300">
                  <strong>Correo electrónico:</strong> soporte@lavirtualzone.com
                </p>
              </div>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle size={24} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-500 mb-2">Aviso Importante</h3>
                <p className="text-gray-300 text-sm">
                  Estos términos pueden ser modificados en cualquier momento. Te recomendamos revisarlos periódicamente.
                  El uso continuado de La Virtual Zone implica la aceptación de las versiones actualizadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
